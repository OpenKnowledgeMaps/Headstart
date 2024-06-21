import os
import sys
import json
import pandas as pd
import logging
from datetime import timedelta
from dateutil.parser import parse
from common.decorators import error_logging_aspect
import re
from redis.exceptions import LockError
import time
import numpy as np
from pyorcid import OrcidAuthentication, Orcid



formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')



class OrcidClient():

    def __init__(self, redis_store=None, language=None, loglevel="INFO") -> None:
        self.redis_store = redis_store
        self.default_params = {}
        self.default_params["language"] = language
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(loglevel)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        handler.setLevel(loglevel)
        self.logger.addHandler(handler)

        self.separation = 0.1
        self.rate_key = 'orcid-ratelimit'
        self.ORCID_CLIENT_ID = os.getenv("ORCID_CLIENT_ID")
        self.ORCID_CLIENT_SECRET = os.getenv("ORCID_CLIENT_SECRET")
        self.access_token = self.authenticate()
        if os.getenv("FLASK_ENV") == "dev":
            self.sandbox = True
        else:
            self.sandbox = False

    @error_logging_aspect(log_level=logging.ERROR)
    def authenticate(self) -> str:
        try:
            orcid_auth = OrcidAuthentication(client_id=self.ORCID_CLIENT_ID,
                                            client_secret=self.ORCID_CLIENT_SECRET)
            access_token = orcid_auth.get_public_access_token()
            return access_token
        except Exception as e:
            raise e

    def next_item(self) -> tuple:
        queue, msg = self.redis_store.blpop("orcid")
        msg = json.loads(msg.decode('utf-8'))
        k = msg.get('id')
        params = msg.get('params')
        params["service"] = "orcid"
        endpoint = msg.get('endpoint')
        return k, params, endpoint
    
    @error_logging_aspect(log_level=logging.INFO)
    def orcid_rate_limit_reached(self) -> bool:
        """
        This implementation is inspired by an implementation of
        Generic Cell Rate Algorithm based rate limiting,
        seen on https://dev.to/astagi/rate-limiting-using-python-and-redis-58gk.
        It has been simplified and adjusted to our use case.

        ORCID allows 24 requests per second, with a burst limit of 40 requests. See also:
        https://info.orcid.org/ufaqs/what-are-the-api-limits/
        """
        
        t = self.redis_store.time()[0]
        self.redis_store.setnx(self.rate_key, 0)
        try:
            with self.redis_store.lock('lock:' + self.rate_key, blocking_timeout=5) as lock:
                theoretical_arrival_time = max(float(self.redis_store.get(self.rate_key)), t)
                if theoretical_arrival_time - t <= 0:
                    new_theoretical_arrival_time = max(theoretical_arrival_time, t) + self.separation
                    self.redis_store.set(self.rate_key, new_theoretical_arrival_time)
                    return False
                return True
        # the locking mechanism is needed if a key is requested multiple times at the same time
        except LockError:
            return True
        
    @error_logging_aspect(log_level=logging.ERROR)
    def run(self) -> None:
        while True:
            while self.orcid_rate_limit_reached():
                self.logger.debug('🛑 Request is limited')
                time.sleep(0.1)
            k, params, endpoint = self.next_item()
            self.logger.debug(k)
            self.logger.debug(params)
            if endpoint == "search":
                try:
                    res = self.execute_search(params)
                    res["id"] = k
                    if res.get("status") == "error" or params.get('raw') is True:
                        self.redis_store.set(k+"_output", json.dumps(res))                        
                    else:
                        self.redis_store.rpush("input_data", json.dumps(res).encode('utf8'))
                        q_len = self.redis_store.llen("input_data")
                        self.logger.debug("Queue length: %s %d %s" %("input_data", q_len, k))
                except Exception as e:
                    self.logger.exception("Exception during data retrieval.")
                    self.logger.error(params)
                    self.logger.error(e)
        
    @error_logging_aspect(log_level=logging.ERROR)
    def execute_search(self, params) -> dict:
        q = params.get('q')
        service = params.get('service')
        data = {}
        data["params"] = params
        orcid_id = params.get("orcid")
        try:
            orcid = Orcid(orcid_id=orcid_id, orcid_access_token=self.access_token, state = "public", sandbox=self.sandbox)
            author_info = extract_author_info(orcid)
            works = retrieve_full_works_metadata(orcid)
            self.logger.debug(works.columns)
            metadata = apply_metadata_schema(works)
            self.logger.debug(metadata.columns)
            # in BASE it is ["title", "paper_abstract", "subject_orig", "published_in", "sanitized_authors"]
            text = pd.concat([metadata.id, metadata[["title", "paper_abstract"]]
                                    .apply(lambda x: " ".join(x), axis=1)], axis=1)
            text.columns = ["id", "content"]
            self.logger.debug(metadata.head())
            self.logger.debug(text.head())
            input_data = {}
            input_data["metadata"] = metadata.to_json(orient='records')
            input_data["text"] = text.to_json(orient='records')
            res = {}
            res["input_data"] = input_data
            # merge author info into params
            params.update(author_info)
            res["params"] = params
            return res
        except Exception as e:
            self.logger.error(e)
            raise

@error_logging_aspect(log_level=logging.ERROR)
def extract_author_info(orcid) -> dict:
    personal_details = orcid.personal_details()
    orcid_id = orcid._orcid_id
    author_name = " ".join(
        [personal_details.get("name", {}).get("given-names", {}).get("value", ""),
         personal_details.get("name", {}).get("family-name", {}).get("value", "")]
    )
    author_keywords = ", ".join(orcid.keywords()[0])
    biography = personal_details.get("biography", {}).get("content", "") \
                    if personal_details.get("biography", {}).get("visibility") == "public" \
                    else ""
    external_identifiers = extract_external_identifiers(orcid)
    countries = extract_countries(orcid)
    websites = extract_websites(orcid)
    author_info = {
        "orcid_id": orcid_id,
        "author_name": author_name,
        "author_keywords": author_keywords,
        "biography": biography,
        "websites": websites,
        "external_identifiers": external_identifiers,
        "country": countries
    }
    return author_info

@error_logging_aspect(log_level=logging.WARNING)
def extract_countries(orcid) -> list:
    countries = pd.DataFrame(orcid.address()["address"])
    countries = countries[countries["visibility"] == "public"]
    countries["country"] = countries["country"].apply(lambda x: x.get("value"))
    countries = countries["country"]
    return countries.tolist()

@error_logging_aspect(log_level=logging.WARNING)
def extract_external_identifiers(orcid) -> list:
    external_identifiers = pd.DataFrame(orcid.external_identifiers()["external-identifier"])
    external_identifiers = external_identifiers[external_identifiers["visibility"] == "public"]
    external_identifiers["external-id-url"] = external_identifiers["external-id-url"].apply(lambda x: x.get("value"))
    external_identifiers = external_identifiers[[ "external-id-type", "external-id-url", "external-id-value", "external-id-relationship"]]
    return external_identifiers.to_dict(orient='records')

@error_logging_aspect(log_level=logging.WARNING)
def extract_websites(orcid) -> list:
    urls = pd.DataFrame(orcid.researcher_urls()["researcher-url"])
    urls = urls[urls["visibility"] == "public"]
    urls["url"] = urls["url"].apply(lambda x: x.get("value"))
    urls = urls[[ "url-name", "url"]]
    return urls.to_dict(orient='records')

@error_logging_aspect(log_level=logging.ERROR)
def retrieve_full_works_metadata(orcid) -> pd.DataFrame:
    works = pd.DataFrame(orcid.works()[1]["group"]).explode("work-summary")
    works = pd.json_normalize(works["work-summary"])
    works["publication-date"] = works.apply(get_publication_date, axis=1)
    works["doi"] = works.apply(extract_dois, axis=1)
    # THIS IS EMPTY FOR NOW BECAUSE WE DON'T HAVE THIS INFO YET
    works["short-description"] = ""
    works["subject_orig"] = ""
    works["subject_cleaned"] = ""
    works["oa_state"] = 2
    works["resulttype"] = works["type"].map(lambda x: [x])
    works["subject"] = ""
    works["sanitized_authors"] = ""    
    return works
    
@error_logging_aspect(log_level=logging.ERROR)
def apply_metadata_schema(works) -> pd.DataFrame:
    works.rename(columns=works_mapping, inplace=True)
    metadata = works
    return metadata
    
def filter_dicts_by_value(dicts, key, value) -> list:
    return [d for d in dicts if d.get(key) == value]
    
@error_logging_aspect(log_level=logging.WARNING)
def extract_dois(work) -> str:
    external_ids = work["external-ids.external-id"]
    external_ids = external_ids if isinstance(external_ids, list) else []
    external_ids = (filter_dicts_by_value(
        external_ids,
        key="external-id-type",
        value="doi") if len(external_ids)>0 else "")
    doi = external_ids[0].get("external-id-value", "") if len(external_ids)>0 else ""
    return doi

@error_logging_aspect(log_level=logging.WARNING)
def get_publication_date(work) -> str:
    year = work["publication-date.year.value"]
    month = work["publication-date.month.value"]
    day = work["publication-date.day.value"]
    publication_date = ""
    parsed_publication_date = publication_date
    if year is not pd.np.NaN:
        publication_date+=str(int(year))
        parsed_publication_date = publication_date
    if month is not pd.np.NaN:
        publication_date+=("-"+str(int(month)))
        date_obj = parse(publication_date)
        parsed_publication_date = date_obj.strftime('%Y-%m')
    if day is not pd.np.NaN:
        publication_date+=("-"+str(int(day)))
        date_obj = parse(publication_date)
        parsed_publication_date = date_obj.strftime('%Y-%m-%d')
    return parsed_publication_date
    

works_mapping = {
    "put-code": "id",
    "title.title.value": "title",
    "short-description": "paper_abstract",
    "publication-date": "year",
    "work-contributors": "authors",
    "url.value": "link",
    "journal-title.value": "published_in"
}
