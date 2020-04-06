import os
import sys
import re
import json
import redis
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search, Q
import pandas as pd
import logging


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

    @staticmethod
    def parse_query(query, fields):
        qq = {}
        # must_groups = list(re.finditer('([\w\-"]* +(?:and|&&|\+) *[\w\-"]*)+', query, re.MULTILINE))
        must_groups = [m.string for m in (re.finditer('([\w\-"]* +(?:and|&&|\+) *[\w\-"]*)+', query, re.I))]
        must = []
        for g in must_groups:
            terms = [t.strip() for t in re.split(r' and|&&|\+ +', g) if t.strip()]
            for term in terms:
                if term:
                    must.append(Q('multi_match', query=term, fields=fields))
        query = re.sub(r'([\w\-"]* +(?:and|&&|\+) *[\w\-"]*)+', '', query, re.M, re.I)
        should_groups = [m.string for m in re.finditer('([\w\-"]+ +(?:or|\|+) *[\w\-"]*)+', query, re.I)]
        query = re.sub(r'([\w\-"]+ +(?:or|\|+) *[\w\-"]*)+', '', query, re.I)
        should_terms = re.split(" +", query)
        should = []
        for g in should_groups + should_terms:
            terms = [t.strip() for t in re.split(r' or|\|+', g) if t.strip()]
            for term in terms:
                if term:
                    should.append(Q('multi_match', query=term, fields=fields))
        exclude = []
        if must:
            qq["must"] = must
        if should:
            qq["should"] = should
        q = Q('bool', **qq)
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
        return body

    def search(self, parameters):
        s = Search(using=self.es)
        # TODO: replace from parameters
        fields = ["title", "abstract"]
        q = self.parse_query(parameters.get('q'), fields)
        s = s.query(q)
        s = s.query("range", date=self.build_date_field(
                    parameters.get('from'),
                    parameters.get('to')))
        index = "isidore-documents-triple"
        sorting = self.build_sort_order(parameters)
        body = self.build_body(parameters)
        self.logger.debug(index)
        self.logger.debug(sorting)
        self.logger.debug(body)
        res = self.es.search(
            index=index,
            body=body,
            size=parameters.get('limit', 100),
            sort=sorting)
        # res = self.es.search(
        #     index=index,
        #     body=s.to_dict(),
        #     size=parameters.get('limit', 100),
        #     sort=sorting)
        if parameters.get('raw') is True:
            return res
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
        df = pd.DataFrame(result.get('hits').get('hits'))
        df = pd.concat([df.drop(["_source"], axis=1),
                        df["_source"].apply(pd.Series)],
                       axis=1)
        metadata = pd.DataFrame()
        metadata["id"] = df.identifier.map(lambda x: x[0] if isinstance(x, list) else "")
        metadata["title"] = df.title.map(lambda x: x[0] if isinstance(x, list) else "")
        metadata["authors"] = df.author.map(lambda x: self.get_authors(x) if isinstance(x, list) else "")
        metadata["paper_abstract"] = df.abstract.map(lambda x: x[0] if isinstance(x, list) else "")
        metadata["published_in"] = df.publisher.map(lambda x: x[0].get('name') if isinstance(x, list) else "")
        metadata["year"] = df.datestamp.map(lambda x: x if isinstance(x, str) else "")
        metadata["url"] = df.url.map(lambda x: x[0] if isinstance(x, list) else "")
        metadata["readers"] = 0
        metadata["subject"] = df.keyword.map(lambda x: "; ".join([self.clean_subject(s) for s in x]) if isinstance(x, list) else "")
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
