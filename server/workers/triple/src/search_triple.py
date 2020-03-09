import os
import json
import redis
from elasticsearch import Elasticsearch
import pandas as pd


with open("config.json") as infile:
    config = json.load(infile)

redis_store = redis.StrictRedis(host="localhost", port=6379, db=0)


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

    def next_item(self):
        queue, msg = redis_store.blpop("triple")
        msg = json.loads(msg)
        k = msg.get('id')
        params = msg.get('params')
        endpoint = msg.get('endpoint')
        return k, params, endpoint

    def get_mappings(self, index):
        return self.es.indices.get_mapping(index)

    def build_date_field(self, _from, _to):
        date = {}
        if len(_from) == 4:
            _from += "-01-01"
        if len(_to) == 4:
            _to += "-12-31"
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

    def search(self, parameters):
        index = "isidore-documents-triple"
        body = {"query": {
                    "bool": {
                        "must": [
                             {"multi_match": {
                                "query": parameters.get('q'),
                                "fields": ["title", "abstract"]
                             }},
                             {"range": {
                                "date": self.build_date_field(
                                        parameters.get('from'),
                                        parameters.get('to'))
                             }}
                        ]
                    }
                }}
        res = self.es.search(
            index=index,
            body=body,
            size=100,
            sort=self.build_sort_order(parameters))
        if parameters.get('raw'):
            return res
        else:
            return self.process_result(res)

    def process_result(self, result):
        df = pd.DataFrame(result.get('hits').get('hits'))
        df = pd.concat([df.drop(["_source"], axis=1),
                        df["_source"].apply(pd.Series)],
                       axis=1)
        return df.to_json()

    def run(self):
        while True:
            k, params, endpoint = self.next_item()
            if endpoint == "mappings":
                res = self.get_mappings(params.get('index'))
                redis_store.set(k, json.dumps(res))
            if endpoint == "search":
                res = self.search(params)
                redis_store.set(k, json.dumps(res))


if __name__ == '__main__':
    tc = TripleClient(config)
    tc.run()
