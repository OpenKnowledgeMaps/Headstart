import os
import sys
import re
import json
import redis
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search, Q
import pandas as pd
import logging


formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')
valid_langs = {
    'en': 'English',
    'fr': 'French',
    'es': 'Spanish'
}


class TripleClient(object):

    def __init__(self, config):
        self.es = Elasticsearch(
            [config.get('host')],
            http_auth=(config.get('user'), config.get('pass')),
            scheme="http" if config.get('host') == 'localhost' else "https",
            port=config.get('port'),
            send_get_body_as='POST',
            http_compress=True
        )
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(os.environ["TRIPLE_LOGLEVEL"])
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        handler.setLevel(os.environ["TRIPLE_LOGLEVEL"])
        self.logger.addHandler(handler)

    def next_item(self):
        queue, msg = redis_store.blpop("triple")
        msg = json.loads(msg)
        k = msg.get('id')
        params = msg.get('params')
        params["service"] = "triple"
        endpoint = msg.get('endpoint')
        return k, params, endpoint

    def get_mappings(self, index):
        return self.es.indices.get_mapping(index)

    def build_date_field(self, _from, _to):
        date = {}
        date["gte"] = _from
        date["lte"] = _to
        return date

    def build_sort_order(self, parameters):
        sort = []
        if parameters.get('sorting') == "most-relevant":
            sort.append("_score:desc")
        if parameters.get('sorting') == "most-recent":
            sort.append("date:desc")
        return sort

    def get_limit(self, parameters):
        limit = parameters.get('limit', 100)
        if isinstance(limit, str):
            limit = int(limit)
        return limit

    def get_lang(self, parameters):
        lang = valid_langs.get(parameters.get('language', 'all'))
        return lang

    @staticmethod
    def parse_query(query, fields):
        q = Q("multi_match", query=query, fields=fields)
        return q

    def build_body(self, parameters):
        body = {"query": {
                    "bool": {
                        "must": [
                             {"multi_match": {
                                "query": parameters.get('q'),
                                "fields": ["title", "abstract"],
                                "type": "cross_fields",
                                "operator": "and",
                             }},
                             {"range": {
                                "date": self.build_date_field(
                                        parameters.get('from'),
                                        parameters.get('to'))
                             }}
                        ]
                    }
                }}
        if parameters.get('language') != "all":
            body["query"]["bool"]["must"].append({"term": {"language": parameters.get('language')}})
        return body

    def search(self, parameters):
        index = "isidore-documents-triple"
        fields = ["title", "abstract"]
        s = Search(using=self.es, index=index)
        # TODO: replace from parameters
        q = self.parse_query(parameters.get('q'), fields)
        s = s.query(q)
        if parameters.get('language') != 'all':
            s = s.filter("match", language__label=self.get_lang(parameters))
        s = s.query("range", date=self.build_date_field(
                    parameters.get('from'),
                    parameters.get('to')))
        #s = s[parameters.get('pagination_from'):parameters.get('pagination_to')]
        s = s[0:self.get_limit(parameters)*2]
        if parameters.get('sorting') == "most-relevant":
            s = s.sort() #  default value
        if parameters.get('sorting') == "most-recent":
            s = s.sort("-date")
        self.logger.debug(s.to_dict())
        res = s.execute()
        if parameters.get('raw') is True:
            return res.to_dict()
        else:
            return self.process_result(res)

    def process_result(self, result):
        """
        # * "id": a unique ID, preferably the DOI
        # * "title": the title
        # * "authors": authors, preferably in the format "LASTNAME1, FIRSTNAME1;LASTNAME2, FIRSTNAME2"
        # * "paper_abstract": the abstract
        # * "published_in": name of the journal or venue
        # * "year": publication date
        # * "url": URL to the landing page
        # * "readers": an indicator of the paper's popularity, e.g. number of readers, views, downloads etc.
        # * "subject": keywords or classification, split by ;
        # * "oa_state": open access status of the item; has the following possible states: 0 for no, 1 for yes, 2 for unknown
        # * "link": link to the PDF; if this is not available, a list of candidate URLs that may contain a link to the PDF
        """
        df = pd.DataFrame((d.to_dict() for d in result))
        metadata = pd.DataFrame()
        metadata["id"] = df.identifier.map(lambda x: x[0] if isinstance(x, list) else "")
        metadata["title"] = df.title.map(lambda x: x[0] if isinstance(x, list) else "")
        metadata["authors"] = df.author.map(lambda x: self.get_authors(x) if isinstance(x, list) else "")
        metadata["paper_abstract"] = df.abstract.map(lambda x: x[0] if isinstance(x, list) else "")
        metadata["published_in"] = df.publisher.map(lambda x: x[0].get('name') if isinstance(x, list) else "")
        metadata["year"] = df.date.map(lambda x: x[0] if isinstance(x, list) else "")
        metadata["url"] = df.url.map(lambda x: x[0] if isinstance(x, list) else "")
        metadata["readers"] = 0
        metadata["subject_orig"] = df.keyword.map(lambda x: "; ".join([self.clean_subject(s) for s in x]) if isinstance(x, list) else "")
        metadata["subject"] = metadata["subject_orig"]
        metadata["oa_state"] = 2
        metadata["link"] = ""
        metadata["relevance"] = df.index
        text = pd.DataFrame()
        text["id"] = metadata["id"]
        text["content"] = metadata.apply(lambda x: ". ".join(x[["title", "paper_abstract"]]), axis=1)
        input_data = {}
        input_data["metadata"] = metadata.to_json(orient='records')
        input_data["text"] = text.to_json(orient='records')
        return input_data

    @staticmethod
    def clean_subject(subject):
        subject_cleaned = re.sub(r"DOAJ:[^;]*(;|$)?", "", subject) # remove DOAJ classification
        subject_cleaned = re.sub(r"/dk/atira[^;]*(;|$)?", "", subject_cleaned) # remove atira classification
        subject_cleaned = re.sub(r"ddc:[0-9]+(;|$)?", "", subject_cleaned) # remove Dewey Decimal Classification
        subject_cleaned = re.sub(r"([\w\/\:-])*?\/ddc\/([\/0-9\.])*", "", subject_cleaned) # remove Dewey Decimal Classification in URI form
        subject_cleaned = re.sub(r"[A-Z,0-9]{2,}-[A-Z,0-9\.]{2,}(;|$)?", "", subject_cleaned) #remove LOC classification
        subject_cleaned = re.sub(r"[^\(;]+\(General\)(;|$)?", "", subject_cleaned) # remove general subjects
        subject_cleaned = re.sub(r"[^\(;]+\(all\)(;|$)?", "", subject_cleaned) # remove general subjects
        subject_cleaned = re.sub(r"[^:;]+ ?:: ?[^;]+(;|$)?", "", subject_cleaned) #remove classification with separator ::
        subject_cleaned = re.sub(r"[^\[;]+\[[A-Z,0-9]+\](;|$)?", "", subject_cleaned) # remove WHO classification
        subject_cleaned = re.sub(r"</keyword><keyword>", "", subject_cleaned) # remove </keyword><keyword>
        subject_cleaned = re.sub(r"\[[^\[]+\][^\;]+(;|$)?", "", subject_cleaned) # remove classification
        subject_cleaned = re.sub(r"[0-9]{2,} [A-Z]+[^;]*(;|$)?", "", subject_cleaned) #remove classification
        subject_cleaned = re.sub(r" -- ", "; ", subject_cleaned) #replace inconsistent keyword separation
        subject_cleaned = re.sub(r" \(  ", "; ", subject_cleaned) #replace inconsistent keyword separation
        subject_cleaned = re.sub(r"(\w* \w*(\.)( \w* \w*)?)", "; ", subject_cleaned) # remove overly broad keywords separated by .
        subject_cleaned = re.sub(r"\. ", "; ", subject_cleaned) # replace inconsistent keyword separation
        subject_cleaned = re.sub(r" ?\d[:?-?]?(\d+.)+", "", subject_cleaned) # replace residuals like 5:621.313.323 or '5-76.95'
        subject_cleaned = re.sub(r"\w+:\w+-(\w+\/)+", "", subject_cleaned) # replace residuals like Info:eu-repo/classification/
        subject_cleaned = re.sub(r"\[\w+\.?\w+\]", "", subject_cleaned) # replace residuals like [shs.hisphilso]
        subject_cleaned = re.sub(r"; ?$", "", subject_cleaned) # remove trailing '; '
        return subject_cleaned

    @staticmethod
    def get_authors(authorlist):
        authors = []
        for a in authorlist:
            if a:
                author = []
                for n in ['lastname', 'firstname']:
                    if a.get(n, [None])[0]:
                        author.append(a.get(n)[0])
                authors.append(", ".join(author))
        return "; ".join(authors)

    def run(self):
        while True:
            k, params, endpoint = self.next_item()
            self.logger.debug(params)
            if endpoint == "mappings":
                res = self.get_mappings(params.get('index'))
                redis_store.set(k+"_output", json.dumps(res))
            if endpoint == "search":
                try:
                    res = {}
                    res["id"] = k
                    res["input_data"] = self.search(params)
                    res["params"] = params
                    if params.get('raw') is True:
                        redis_store.set(k+"_output", json.dumps(res))
                    else:
                        redis_store.rpush("input_data", json.dumps(res))
                except Exception as e:
                    self.logger.error(e)
                    self.logger.error(params)


if __name__ == '__main__':
    with open("es_config.json") as infile:
        es_config = json.load(infile)
    with open("redis_config.json") as infile:
        redis_config = json.load(infile)

    redis_store = redis.StrictRedis(**redis_config)
    tc = TripleClient(es_config)
    tc.run()
