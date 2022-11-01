import os
import json
import subprocess
import pandas as pd
import logging
from common.r_wrapper import RWrapper
import re
from .parsers import improved_df_parsing


formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')


class BaseClient(RWrapper):

    def __init__(self, *args):
        super().__init__(*args)
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
            raw_text = json.loads(output[-1])
            if isinstance(raw_metadata, dict) and raw_metadata.get('status') == "error":
                res = raw_metadata
            else:
                metadata = pd.DataFrame(raw_metadata)
                metadata = filter_duplicates(metadata)
                metadata = metadata.head(params.get('list_size'))
                metadata.reset_index(inplace=True, drop=True)
                metadata = self.enrich_metadata(metadata)
                text = pd.concat([metadata.id, metadata[["title", "paper_abstract", "subject_orig", "published_in", "authors"]]
                                         .apply(lambda x: " ".join(x), axis=1)], axis=1)
                text.columns = ["id", "content"]
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

    def run(self):
        while True:
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


pattern = re.compile(r"\.v(\d)+$")
def identify_versioned_doi(doi):
    m = pattern.findall(doi)
    if m:
        return int(m[0])
    else:
        return None
    
def extract_doi_suffix(doi):
    return doi.split("/")[4:]

def get_unversioned_doi(doi):
    return pattern.sub("", doi)

def mark_duplicate_dois(df):
    df["doi_duplicate"] = False
    for doi, index in df.groupby("doi").groups.items():
        if doi:
            if len(index) > 1:
                df.loc[index, "doi_duplicate"] = True
    return df

def mark_duplicate_links(df):
    df["link_duplicate"] = False
    for link, index in df.groupby("link").groups.items():
        if link:
            if len(index) > 1:
                df.loc[index, "link_duplicate"] = True
    return df

def mark_latest(df):
    df["is_latest"] = True
    for udoi in df.unversioned_doi.unique():
        if udoi:
            tmp = df[df.doi.str.contains(udoi)]
            if len(tmp) > 1:
                df.loc[tmp.index, "is_latest"] = False
                versions = tmp.id
                latest = tmp.sort_values("versioned_doi", ascending=False).head(1).id
                v = [{"versions": versions.values.tolist(), "latest": latest.values.tolist()}]*len(tmp)
                df.loc[versions.index, "versions"] = v
                df.loc[latest.index, "is_latest"] = True
    return df

def identify_relations(df):
    df["has_relations"] = False
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

def filter_duplicates(df):
    df["versioned_doi"] = df.doi.map(lambda x: identify_versioned_doi(x) if type(x) is str else None)
    df["unversioned_doi"] = df.doi.map(lambda x: get_unversioned_doi(x) if type(x) is str else None)
    df["doi_suffix"] = df.doi.map(lambda x: extract_doi_suffix(x) if type(x) is str else None)
    df["doi_suffix_0"] =  df.doi_suffix.map(lambda x: x[0] if len(x) > 0 else None)
    df["doi_suffix_1"] =  df.doi_suffix.map(lambda x: "/".join(x[:-1]) if len(x) > 0 else None)
    df = mark_duplicate_dois(df)
    df = mark_duplicate_links(df)
    df = identify_relations(df)
    df = mark_latest(df)
    df = remove_false_positives_doi(df)
    df = remove_false_positives_link(df)
    df = add_false_negatives(df)
    df = df[df.is_latest]
    return df