import os
import sys
import json
import pandas as pd
import logging
from datetime import timedelta
from dateutil.parser import parse
from common.decorators import error_logging_aspect
from common.deduplication import find_duplicate_indexes,\
    prioritize_OA_and_latest, mark_latest_doi, mark_duplicates
import re
from redis.exceptions import LockError
import time
import numpy as np
from pyorcid import OrcidAuthentication, Orcid
from typing import Tuple
import requests



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

    def next_item(self) -> Tuple[str, dict, str]:
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
        """
        This function is the main loop of the OrcidClient. It will continuously
        check for new items in the Redis queue, process them, and store the results
        back in Redis.

        The function will also check if the rate limit for ORCID requests is reached.

        return: None
        """
        # TODO: add retry mechanism
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
                    self.logger.debug(res)
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
    def execute_search(self, params: dict) -> dict:
        """
        This function is the main function for the search endpoint. It will
        retrieve the ORCID data for the given ORCID ID, extract the author
        information and the works metadata, and return the results.
        In case of errors, it will return an error reason. Following errors
        are possible:
        - invalid orcid id
        - not enough results for orcid
        - unexpected data processing error        

        Parameters:
        - params (dict): The parameters for the search endpoint. The parameters
        should contain the ORCID ID of the author.
        
        Returns:
        - dict: The results of the search endpoint.
        """
        q = params.get('q')
        service = params.get('service')
        data = {}
        data["params"] = params
        orcid_id = params.get("orcid")
        try:
            orcid = Orcid(orcid_id=orcid_id, orcid_access_token=self.access_token, state = "public", sandbox=self.sandbox)
        except Exception as e:
            self.logger.error(e)
            res = {}
            res["params"] = params
            res["status"] = "error"
            res["reason"] = ["invalid orcid id"]
            self.logger.debug(
                f"ORCID {orcid_id} is invalid."
            )
            return res

        try:
            author_info = extract_author_info(orcid)
            metadata = retrieve_full_works_metadata(orcid)
            self.logger.debug(f"metadata retrieved and length is: {len(metadata)}")
            self.logger.debug(metadata)

            if len(metadata) == 0:
                res = {}
                res["params"] = params
                res["status"] = "error"
                res["reason"] = ["not enough results for orcid"]
                self.logger.debug(
                    f"ORCID {orcid_id} has no works metadata."
                )
                return res
            metadata["authors"] = metadata["authors"].map(lambda x: author_info["author_name"] if x=="" else x)
            #metadata = mark_duplicates(metadata)
            #metadata = filter_duplicates(metadata)
            metadata = sanitize_metadata(metadata)
            metadata = metadata.head(int(params.get("limit")))
            # in BASE it is ["title", "paper_abstract", "subject_orig", "published_in", "sanitized_authors"]
            text = pd.concat([metadata.id, metadata[["title", "paper_abstract", "subtitle", "published_in", "authors"]]
                                    .apply(lambda x: " ".join(x), axis=1)], axis=1)
            text.columns = ["id", "content"]
            input_data = {}
            input_data["metadata"] = metadata.to_json(orient='records')
            input_data["text"] = text.to_json(orient='records')
            res = {}
            res["input_data"] = input_data
            # merge author info into params
            params.update(author_info)
            res["params"] = params
            return res
        except ValueError as e:
            self.logger.error(e)
            self.logger.error(params)
            res = {}
            res["params"] = params
            res["status"] = "error"
            res["reason"] = ["invalid orcid id"]
            return res
        except Exception as e:
            self.logger.error(e)
            res = {}
            res["params"] = params
            res["status"] = "error"
            res["reason"] = ["unexpected data processing error"]
            return res


# TODO: the following functions should be moved to a separate module
def get_nested_value(data, keys, default=None):
    """
    Recursively retrieves a nested value from a dictionary.

    :param data: Dictionary to retrieve the value from
    :param keys: List of keys to follow in the dictionary
    :param default: Default value to return if any key is not found
    :return: The retrieved value or the default value
    """
    for key in keys:
        try:
            data = data.get(key)
            if data is None:
                return default
        except AttributeError:
            return default
    return data


@error_logging_aspect(log_level=logging.ERROR)
def extract_author_info(orcid: Orcid) -> dict:
    """
    This function extracts the author information from the ORCID data.
    
    Parameters:
    - orcid (Orcid): The Orcid object containing the ORCID data.

    Returns:
    - dict: The author information extracted from the ORCID data.
    """
    personal_details = orcid.personal_details()
    orcid_id = orcid._orcid_id
    author_name = " ".join(
        [personal_details.get("name", {}).get("given-names", {}).get("value", ""),
         personal_details.get("name", {}).get("family-name", {}).get("value", "")]
    )
    author_keywords = ", ".join(orcid.keywords()[0])
    biography = personal_details.get("biography", {}).get("content", "") \
                    if (personal_details.get("biography") and personal_details.get("biography", {}).get("visibility") == "public" )\
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
def sanitize_metadata(metadata: pd.DataFrame) -> pd.DataFrame:
    """
    This function sanitizes the metadata DataFrame by converting all columns
    to string type and filling missing values with an empty string.

    Parameters:
    - metadata (pd.DataFrame): The metadata DataFrame to sanitize.

    Returns:
    - pd.DataFrame: The sanitized metadata DataFrame.
    """
    metadata["title"] = metadata["title"].fillna("").astype(str)
    metadata["subtitle"] = metadata["subtitle"].fillna("").astype(str)
    metadata["paper_abstract"] = metadata["paper_abstract"].fillna("").astype(str)
    metadata["published_in"] = metadata["published_in"].fillna("").astype(str)
    return metadata

@error_logging_aspect(log_level=logging.WARNING)
def extract_countries(orcid: Orcid) -> list:
    countries = pd.DataFrame(orcid.address()["address"])
    if not countries.empty:
        countries = countries[countries["visibility"] == "public"]
        countries["country"] = countries["country"].apply(lambda x: x.get("value"))
        countries = countries["country"]
        return countries.tolist()
    else:
        return []

@error_logging_aspect(log_level=logging.WARNING)
def extract_external_identifiers(orcid: Orcid) -> list:
    external_identifiers = pd.DataFrame(orcid.external_identifiers()["external-identifier"])
    if not external_identifiers.empty:
        external_identifiers = external_identifiers[external_identifiers["visibility"] == "public"]
        external_identifiers["external-id-url"] = external_identifiers["external-id-url"].apply(lambda x: x.get("value"))
        external_identifiers = external_identifiers[[ "external-id-type", "external-id-url", "external-id-value", "external-id-relationship"]]
        return external_identifiers.to_dict(orient='records')
    else:
        return []

@error_logging_aspect(log_level=logging.WARNING)
def extract_websites(orcid: Orcid) -> list:
    urls = pd.DataFrame(orcid.researcher_urls()["researcher-url"])
    if not urls.empty:
        urls = urls[urls["visibility"] == "public"]
        urls["url"] = urls["url"].apply(lambda x: x.get("value"))
        urls = urls[[ "url-name", "url"]]
        return urls.to_dict(orient='records')
    else:
        return []

def get_short_description(work) -> str:
    return get_nested_value(work, ["short-description"], "")


def get_authors(work) -> str:
    try:
        contributors = get_nested_value(work, ["contributors", "contributor"], [])

        authors = []

        for contributor in contributors:
            author = get_nested_value(contributor, ["credit-name", "value"], None)

            if author:
                authors.append(author)

        authors_str = "; ".join(authors)
    except KeyError:
        authors_str = ""

    return authors_str


def get_subjects(work) -> str:
    return get_nested_value(work, ["subject"], "")


def get_title(work) -> str:
    return get_nested_value(work, ["title", "title", "value"], "")


def get_subtitle(work) -> str:
    return get_nested_value(work, ["title", "subtitle", "value"], "")


def get_paper_abstract(work) -> str:
    return get_nested_value(work, ["short-description"], "")


def get_resulttype(work) -> str:
    return get_nested_value(work, ["type"], "")


def published_in(work) -> str:
    return get_nested_value(work, ["journal-title", "value"], "")

def get_put_code(work) -> str:
    return get_nested_value(work, ["put-code"], "")

@error_logging_aspect(log_level=logging.ERROR)
def retrieve_full_works_metadata(orcid: Orcid) -> pd.DataFrame:
    """
    This function retrieves the full works metadata from the ORCID data.

    Parameters:
    - orcid (Orcid): The Orcid object containing the ORCID data.

    Returns:
    - pd.DataFrame: The full works metadata retrieved from the ORCID data.
    """
    works_data = pd.DataFrame(orcid.works_full_metadata(limit=1000))
    # works["publication-date"] = works.apply(get_publication_date, axis=1)
    # works["doi"] = works.apply(extract_dois, axis=1)

    new_works_data = pd.DataFrame()

    if works_data.empty:
        return new_works_data

    # Perform transformations and store in new DataFrame
    new_works_data["id"] = works_data.apply(get_put_code, axis=1)
    new_works_data["title"] = works_data.apply(get_title, axis=1)
    new_works_data["subtitle"] = works_data.apply(get_subtitle, axis=1)
    new_works_data["authors"] = works_data.apply(get_authors, axis=1)
    new_works_data["paper_abstract"] = works_data.apply(get_paper_abstract, axis=1).fillna("")
    new_works_data["year"] = works_data.apply(get_publication_date, axis=1)
    new_works_data["published_in"] = works_data.apply(published_in, axis=1)
    new_works_data["resulttype"] = works_data.apply(get_resulttype, axis=1).map(lambda x: doc_type_mapping.get(x, ""))
    new_works_data["doi"] = works_data.apply(extract_dois, axis=1)
    new_works_data["oa_state"] = 2
    new_works_data["subject"] = "" # this needs to come from BASE enrichment
    new_works_data["citation_count"] = np.random.randint(0, 100, size=len(works_data))

    return new_works_data

    
@error_logging_aspect(log_level=logging.ERROR)
def apply_metadata_schema(works: pd.DataFrame) -> pd.DataFrame:
    works.rename(columns=works_mapping, inplace=True)
    metadata = works
    return metadata
    
def filter_dicts_by_value(dicts, key, value) -> list:
    return [d for d in dicts if d.get(key) == value]
    
@error_logging_aspect(log_level=logging.WARNING)
def extract_dois(work: pd.DataFrame) -> str:
    external_ids = work["external-ids"]
    external_ids = external_ids["external-id"] if external_ids else []
    external_ids = external_ids if isinstance(external_ids, list) else []
    external_ids = (filter_dicts_by_value(
        external_ids,
        key="external-id-type",
        value="doi") if len(external_ids)>0 else "")
    doi = external_ids[0].get("external-id-value", "") if len(external_ids)>0 else ""
    return doi

@error_logging_aspect(log_level=logging.WARNING)
def get_publication_date(work) -> str:
    try:
        year = work["publication-date"]["year"]["value"]
    except Exception:
        year = np.NaN
    try:
        month = work["publication-date"]["month"]["value"]
    except Exception:
        month = np.NaN
    try:
        day = work["publication-date"]["day"]["value"]
    except Exception:
        day = np.NaN
    publication_date = ""
    parsed_publication_date = publication_date
    if year is not np.NaN:
        publication_date+=str(int(year))
        parsed_publication_date = publication_date
    if month is not np.NaN:
        publication_date+=("-"+str(int(month)))
        date_obj = parse(publication_date)
        parsed_publication_date = date_obj.strftime('%Y-%m')
    if day is not np.NaN:
        publication_date+=("-"+str(int(day)))
        date_obj = parse(publication_date)
        parsed_publication_date = date_obj.strftime('%Y-%m-%d')
    return parsed_publication_date

@error_logging_aspect(log_level=logging.ERROR)
def filter_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    df.drop_duplicates("id", inplace=True, keep="first")
    df["is_latest"] = True
    df["doi_duplicate"] = False
    df["has_relations"] = False
    df["link_duplicate"] = False
    df["keep"] = False
    dupind = find_duplicate_indexes(df)
    pure_datasets = df[df.type == "data-set"]
    non_datasets = df.loc[df.index.difference(pure_datasets.index)]
    non_datasets = prioritize_OA_and_latest(non_datasets, dupind)
    pure_datasets = mark_latest_doi(pure_datasets, dupind)
    filtered_non_datasets = non_datasets[non_datasets.is_latest==True]
    filtered_datasets = pure_datasets[(pure_datasets.keep==True) | (pure_datasets.is_duplicate==False)]
    filtered = pd.concat([filtered_non_datasets, filtered_datasets])
    filtered.sort_index(inplace=True)
    return filtered

@error_logging_aspect(log_level=logging.ERROR)
def enrich_from_BASE(metadata: pd.DataFrame) -> pd.DataFrame:
    """
    This function enriches the metadata DataFrame with additional information
    from the BASE database.

    Parameters:
    - metadata (pd.DataFrame): The metadata DataFrame to enrich.

    Returns:
    - pd.DataFrame: The enriched metadata DataFrame.
    """
    dois = metadata[metadata.doi.map(lambda x: len(x)>0)].doi.to_list()
    doi_batches = batch_dois(dois)
    url_BASE = "http://proxy-proxy-1/"+os.getenv("COMPOSE_PROJECT_NAME")+"/base/search"
    params_BASE = {
        "q": "",
        "sorting": "most-relevant",
        "document_types": ["4", "11", "111", "13", "16", "7", "5",
                        "12", "121", "122", "17", "19", "3", "52",
                        "2", "F", "1A", "14", "15", "6", "51",
                        "1", "18", "181", "183", "182"],
        "from": "1665-01-01",
        "to": pd.Timestamp.now().strftime("%Y-%m-%d"),
        "vis_type": "overview",
        "raw": True,
        "list_size": 120,
        "min_descsize": 0
    }

    tmp = []
    for batch in doi_batches:
        try:
            params_BASE["q_advanced"] = batch
            response = requests.post(url_BASE, json=params_BASE)
            data = response.json()
            if "input_data" in data:
                tmp.append(pd.DataFrame(json.loads(data['input_data']["metadata"])))
        except Exception as e:
            logging.error(e)
    enrichment_data = pd.concat(tmp)
    enrichment_data = enrichment_data[enrichment_data.doi.str.contains("|".join(dois))]
    return metadata

def batch_dois(strings, limit=400):
    """
    This function batches a list of strings into groups of strings that
    together are less than a specified limit.
    It is used to batch DOIs for BASE enrichment.

    Parameters:
    - strings (list): The list of strings to batch.

    Returns:
    - list: The list of batches of strings.
    """
    batches = []
    current_batch = ""

    for string in strings:
        substring = 'OR dcdoi:"'+string+'"'
        if len(current_batch) + len(substring) + 1 > limit:  # +1 for space or no space if first
            batches.append("("+current_batch.strip()+")")  # Add current batch to batches
            current_batch = 'dcdoi:"'+string+'"'  # Start a new batch with the current string
        else:
            current_batch += " " + substring if current_batch else substring  # Add string to current batch
            
    if current_batch:  # Add the last batch if it's not empty
        batches.append("("+current_batch.strip()+")")

    return batches

works_mapping = {
    "put-code": "id",
    "title.title.value": "title",
    "short-description": "paper_abstract",
    "publication-date": "year",
    "work-contributors": "authors",
    "journal-title.value": "published_in"
}

doc_type_mapping = {
    "book": "Book",
    "book-chapter": "Book chapter",
    "book-review": "Book review",
    "dictionary-entry": "Dictionary entry",
    "dissertation": "Dissertation",
    "dissertation-thesis": "Dissertation thesis",
    "enyclopaedia-entry": "Encyclopedia entry",
    "edited-book": "Edited book",
    "journal-article": "Journal article",
    "journal-issue": "Journal issue",
    "magazine-article": "Magazine article",
    "manual": "Manual",
    "online-resource": "Online resource",
    "newsletter-article": "Newsletter article",
    "newspaper-article": "Newspaper article",
    "preprint": "Preprint",
    "report": "Report",
    "review": "Review",
    "research-tool": "Research tool",
    "supervised-student-publication": "Supervised student publication",
    "test": "Test",
    "translation": "Translation",
    "website": "Website",
    "working-paper": "Working paper",
    "conference-abstract": "Conference abstract",
    "conference-paper": "Conference paper",
    "conference-poster": "Conference poster",
    "disclosure": "Disclosure",
    "license": "License",
    "patent": "Patent",
    "registered-copyright": "Registered copyright",
    "trademark": "Trademark",
    "annotation": "Annotation",
    "artistic-performance": "Artistic performance",
    "data-management-plan": "Data management plan",
    "data-set": "Dataset",
    "invention": "Invention",
    "lecture-speech": "Lecture speech",
    "physical-object": "Physical object",
    "research-technique": "Research technique",
    "software": "Software",
    "spin-off-company": "Spin-off company",
    "standards-and-policy": "Standards and policy",
    "technical-standard": "Technical standard",
    "other": "Other"
}