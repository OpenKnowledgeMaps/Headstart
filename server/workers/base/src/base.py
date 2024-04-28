import os
import json
import subprocess
import pandas as pd
import logging
from datetime import timedelta
from common.r_wrapper import RWrapper
import re
from redis.exceptions import LockError
import time
import numpy as np
from parsers import improved_df_parsing

from datetime import datetime
import dateparser
import sys

formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')


class BaseClient(RWrapper):

    def __init__(self, *args):
        super().__init__(*args)
        # set separation for requests
        # respecting BASE rate limit of 1 qps
        # separation = round(period_in_seconds / rate limit per second)
        self.separation = 1.5
        self.rate_key = 'base-ratelimit'

        try:
            result = self.get_contentproviders()
            df = pd.DataFrame(json.loads(result["contentproviders"]))
            df.set_index("name", inplace=True)
            cp_dict = df.internal_name.to_dict()
            self.content_providers = cp_dict
        except Exception as e:
            self.logger.error(e)
            self.content_providers = {}

    def next_item(self):
        queue, msg = self.redis_store.blpop("base")
        msg = json.loads(msg.decode('utf-8'))
        k = msg.get('id')
        params = self.add_default_params(msg.get('params'))
        params["service"] = "base"
        endpoint = msg.get('endpoint')
        return k, params, endpoint

    def base_rate_limit_reached(self):
        """
        This implementation is inspired by an implementation of
        Generic Cell Rate Algorithm based rate limiting,
        seen on https://dev.to/astagi/rate-limiting-using-python-and-redis-58gk.
        It has been simplified and adjusted to our use case.

        BASE demands one request per second (1 QPS), per
        https://www.base-search.net/about/download/base_interface.pdf
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

    def execute_search(self, params):
        q = params.get('q')
        service = params.get('service')
        data = {}
        data["params"] = params
        cmd = [self.command, self.runner, self.wd,
               q, service]
        try:
            proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                    encoding='utf-8')
            stdout, stderr = proc.communicate(json.dumps(data))
            output = [o for o in stdout.split('\n') if len(o) > 0]
            error = [o for o in stderr.split('\n') if len(o) > 0]
            raw_metadata = json.loads(output[-2])
            if isinstance(raw_metadata, dict) and raw_metadata.get('status') == "error":
                res = raw_metadata
            else:
                metadata = pd.DataFrame(raw_metadata)
                metadata = self.sanitize_metadata(metadata)
                metadata = filter_duplicates(metadata)
                metadata = pd.concat([metadata, parse_annotations_for_all(metadata, "subject_orig")], axis=1)
                metadata = metadata.head(params.get('list_size'))
                metadata.reset_index(inplace=True, drop=True)
                metadata = self.enrich_metadata(metadata)
                custom_clustering = params.get("custom_clustering")
                if "custom_clustering" in params.keys():
                    if custom_clustering not in metadata.columns:
                        text = pd.concat([metadata.id, metadata["annotations"].map(lambda x: x.get(custom_clustering, ""))], axis=1)
                    elif custom_clustering in metadata.columns:
                        text = pd.concat([metadata.id, metadata[custom_clustering]], axis=1)
                    else:
                        raise Exception("Custom clustering metadata not found.")
                else:
                    text = pd.concat([metadata.id, metadata[["title", "paper_abstract", "subject_orig", "published_in", "sanitized_authors"]]
                                                     .apply(lambda x: " ".join(x), axis=1)], axis=1)
                text.columns = ["id", "content"]
                # if text.content is a list, force it to be a string
                text.content = text.content.map(lambda x: ", ".join(x) if isinstance(x, list) else x)
                # clean up content, start with stripping whitespace
                text.content = text.content.map(lambda x: x.strip())
                input_data = {}
                input_data["metadata"] = metadata.to_json(orient='records')
                input_data["text"] = text.to_json(orient='records')
                res = {}
                res["input_data"] = input_data
                res["params"] = params
            return res
        except Exception as e:
            self.logger.error(e)
            self.logger.error(error)
            raise

    def sanitize_metadata(self, metadata):

        metadata["sanitized_authors"] = metadata["authors"].map(lambda x: sanitize_authors(x))
        metadata["year"] = metadata["year"].map(lambda x: sanitize_year(x))

        return metadata

    def enrich_metadata(self, metadata):
        metadata["repo"] = metadata["content_provider"].map(lambda x: self.content_providers.get(x, ""))
        enrichment = improved_df_parsing(metadata)
        metadata = pd.concat([metadata, enrichment], axis=1)
        return metadata

    def get_contentproviders(self):
        runner = os.path.abspath(os.path.join(self.wd, "run_base_contentproviders.R"))
        cmd = [self.command, runner, self.wd]
        try:
            proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                    encoding='utf-8')
            stdout, stderr = proc.communicate()
            output = [o for o in stdout.split('\n') if len(o) > 0]
            error = [o for o in stderr.split('\n') if len(o) > 0]
            raw = json.loads(output[-1])
            if isinstance(raw, dict) and raw.get('status') == "error":
                res = raw
            else:
                contentproviders = pd.DataFrame(raw)
                res = {}
                res["contentproviders"] = contentproviders.to_json(orient='records')
            return res
        except Exception as e:
            self.logger.error(e)
            self.logger.error(error)
            raise

    def run(self):
        while True:
            while self.base_rate_limit_reached():
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
                        self.redis_store.set(k + "_output", json.dumps(res))
                    else:
                        self.redis_store.rpush("input_data", json.dumps(res).encode('utf8'))
                        q_len = self.redis_store.llen("input_data")
                        self.logger.debug("Queue length: %s %d %s" %("input_data", q_len, k))
                except Exception as e:
                    self.logger.exception("Exception during data retrieval.")
                    self.logger.error(params)
                    self.logger.error(e)

            if endpoint == "contentproviders":
                try:
                    res = self.get_contentproviders()
                    res["id"] = k
                    self.redis_store.set(k+"_output", json.dumps(res))
                except Exception as e:
                    self.logger.exception("Exception during retrieval of contentproviders.")
                    self.logger.error(params)
                    self.logger.error(e)

pattern_doi = re.compile(r"\.v(\d)+$")
pattern_annotations = re.compile(r"([A-Za-z]+:[\w'\- ]+);?")

def find_version_in_doi(doi):
    m = pattern_doi.findall(doi)
    if m:
        return int(m[0])
    else:
        return None

def extract_doi_suffix(doi):
    return doi.split("/")[4:]

def get_unversioned_doi(doi):
    doi = "/".join(doi.split("/")[3:6])
    return pattern_doi.sub("", doi)

def get_publisher_doi(doi):
    pdoi = re.findall(r"org/10\.(\d+)", doi)
    if len(pdoi) > 0:
        return pdoi[0]
    else:
        return ""

def mark_duplicate_dois(df):
    for doi, index in df.groupby("doi").groups.items():
        if doi:
            if len(index) > 1:
                df.loc[index, "doi_duplicate"] = True
    return df

def mark_duplicate_links(df):
    for link, index in df.groupby("link").groups.items():
        if link:
            if len(index) > 1:
                df.loc[index, "link_duplicate"] = True
    return df

def identify_relations(df):
    for udoi in df.unversioned_doi.unique():
        if udoi:
            tmp = df[df.identifier.str.contains(udoi)]
            if len(tmp) > 1:
                relations = tmp.id
                r = pd.Series([relations.values.tolist()]*len(tmp), index=relations.index)
                df.loc[relations.index, "relations"] = r
                df.loc[relations.index, "has_relations"] = True
    return df

def remove_false_positives_doi(df):
    df.loc[df[(df.doi != "") & (df.is_duplicate) & (~df.doi_duplicate)].index, "is_duplicate"] = False
    return df

def remove_false_positives_link(df):
    df.loc[df[(df.link != "") & (df.is_duplicate) & (~df.link_duplicate)].index, "is_duplicate"] = False
    return df

def add_false_negatives(df):
    df.loc[df[(~df.is_duplicate) & (df.link_duplicate)].index, "is_duplicate"] = True
    df.loc[df[(~df.is_duplicate) & (df.doi_duplicate)].index, "is_duplicate"] = True
    return df


def find_duplicate_indexes(df):
    dupind = df.id.map(lambda x: df[df.duplicates.str.contains(x)].index)
    tmp = pd.DataFrame(dupind).astype(str).drop_duplicates().index
    return dupind[tmp]

def mark_latest_doi(df, dupind):
    for _, idx in dupind.iteritems():
        idx = df.index.intersection(idx)
        tmp = df.loc[idx]
        for udoi in list(filter(None, tmp.unversioned_doi.unique().tolist())):
            tmp2 = tmp[tmp.unversioned_doi == udoi]
            if len(tmp2) > 0:
                df.loc[tmp2.index, "is_latest"] = False
                df.loc[tmp2.index, "keep"] = False
                versions = tmp2.id
                latest = tmp2.sort_values("doi_version", ascending=False).head(1).id
                v = [{"versions": versions.values.tolist(), "latest": latest.values.tolist()}]*len(tmp2)
                df.loc[versions.index, "versions"] = v
                df.loc[latest.index, "is_latest"] = True
                df.loc[latest.index, "keep"] = True
    return df


def remove_textual_duplicates_from_different_sources(df, dupind):
    for _, idx in dupind.iteritems():
        if len(idx) > 1:
            tmp = df.loc[idx]
            df.loc[tmp.index, "is_duplicate"] = True
            df.loc[tmp.index, "is_latest"] = False
            publisher_dois = list(filter(None, tmp.publisher_doi.unique().tolist()))
            if len(publisher_dois) > 0:
                # keep entry with doi
                df.loc[idx, "keep"] = False
                df.loc[tmp[tmp.publisher_doi!=""].index, "is_latest"] = True
                df.loc[tmp[tmp.publisher_doi!=""].index, "keep"] = True
            else:
                df.loc[tmp.sort_values(["doi", "year"], ascending=[False, False]).head(1).index, "is_latest"] = True
                df.loc[tmp.sort_values(["doi", "year"], ascending=[False, False]).head(1).index, "keep"] = True
    return df

def prioritize_OA_and_latest(df, dupind):
    for _, idx in dupind.iteritems():
        idx = df.index.intersection(idx)
        if len(idx) > 1:
            tmp = df.loc[idx]
            df.loc[idx, "keep"] = False
            df.loc[idx, "is_latest"] = False
            if len(tmp[tmp.oa_state=="1"]) > 0:
                df.loc[tmp[tmp.oa_state=="1"].sort_values("year", ascending=False).head(1).index, "keep"] = True
                df.loc[tmp[tmp.oa_state=="1"].sort_values("year", ascending=False).head(1).index, "is_latest"] = True
            else:
                df.loc[tmp.sort_values("year", ascending=False).head(1).index, "keep"] = True
                df.loc[tmp.sort_values("year", ascending=False).head(1).index, "is_latest"] = True
    return df

def filter_duplicates(df):
    df.drop_duplicates("id", inplace=True, keep="first")
    df["is_latest"] = True
    df["doi_duplicate"] = False
    df["has_relations"] = False
    df["link_duplicate"] = False
    df["keep"] = False
    df["duplicates"] = df.apply(lambda x: ",".join([x["id"], x["duplicates"]]) if len(x["duplicates"].split(",")) >= 1 else x["duplicates"], axis=1)
    df["doi_version"] = df.doi.map(lambda x: find_version_in_doi(x) if type(x) is str else None)
    df["unversioned_doi"] = df.doi.map(lambda x: get_unversioned_doi(x) if type(x) is str else None)
    df["publisher_doi"] = df.doi.map(lambda x: get_publisher_doi(x))
    dupind = find_duplicate_indexes(df)
    df = mark_duplicate_dois(df)
    df = mark_duplicate_links(df)
    df = identify_relations(df)
    df = remove_false_positives_doi(df)
    df = remove_false_positives_link(df)
    df = remove_textual_duplicates_from_different_sources(df, dupind)
    df = add_false_negatives(df)
    df = mark_latest_doi(df, dupind)
    pure_datasets = df[df.typenorm == "7"]
    non_datasets = df.loc[df.index.difference(pure_datasets.index)]
    non_datasets = prioritize_OA_and_latest(non_datasets, dupind)
    pure_datasets = mark_latest_doi(pure_datasets, dupind)
    filtered_non_datasets = non_datasets[non_datasets.is_latest==True]
    filtered_datasets = pure_datasets[(pure_datasets.keep==True) | (pure_datasets.is_duplicate==False)]
    filtered = pd.concat([filtered_non_datasets, filtered_datasets])
    filtered.sort_index(inplace=True)
    for c in ["doi_duplicate", "link_duplicate", "is_latest", "keep", "duplicates", "doi_version", "unversioned_doi", "publisher_doi", "has_relations", "versions"]:
        if c in filtered.columns:
            filtered.drop(c, axis=1, inplace=True)
    return filtered

def parse_annotations(field):
    if type(field) is str:
        try:
            # keep only first annotation of each type
            matches = pattern_annotations.findall(field)
            matches = [{m.split(":")[0]: m.split(":")[1]} for m in matches]
            annotations = pd.DataFrame(matches)
            annotations = annotations.fillna(method="backfill").head(1).T[0]
            return annotations.to_dict()
        except Exception as e:
            return {}
    else:
        return {}


def parse_annotations_for_all(metadata, field_name):
    parsed_annotations = pd.DataFrame(metadata[field_name].map(lambda x: parse_annotations(x)))
    parsed_annotations.columns = ["annotations"]
    return parsed_annotations


def clean_up_annotations(df, field):
    df[field] = df[field].map(lambda x: pattern_annotations.sub("", x).strip())
    return df

def sanitize_authors(authors, n=15):
    authors = authors.split("; ")
    if len(authors) > n:
        authors = authors[:n-1] + authors[-1:]
    return "; ".join(authors)


def sanitize_year(year_str):

    sanitized_year = ''
    date_formats = ["%Y-%m-%d", "%Y-%m", "%Y-%m-%dT%H:%M:%SZ", "%Y %b %d"]

    for fmt in date_formats:
        try:
            #date_time_obj = datetime.strptime(year_str, fmt)
            dateparser.parse(year_str)
            sanitized_year = year_str  # here we keep the original string
            break
        except ValueError:
            continue

    # Handle formats like "2019"
    if year_str.isdigit() and not sanitized_year:  # check sanitized_year to avoid overwriting
        sanitized_year = year_str  # here we keep the original string

    return sanitized_year
