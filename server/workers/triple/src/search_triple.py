import os
import json
import redis
from elasticsearch import Elasticsearch


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
        params = msg.get('data')
        endpoint = msg.get('endpoint')
        return k, params, endpoint

    def get_mappings(self, index):
        return self.es.indices.get_mapping(index)

    def search(self, parameters):
        index = "isidore-documents-triple"
        body = {"query": {
                "bool": {
                "must": [
                 {"match": {}}
                ]
                }
        }}
        query = {}
        return query

    def run(self):
        while True:
            k, params, endpoint = self.next_item()
            if endpoint == "mappings":
                res = self.get_mappings(params.get('index'))
                redis_store.set(k, json.dumps(res))


if __name__ == '__main__':
    tc = TripleClient(config)
    tc.run()
