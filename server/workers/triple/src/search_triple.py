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
            scheme="http" if config.get('host') == 'localhost' else "https",
            port=config.get('port'),
            send_get_body_as='POST',
            http_compress=True
        )

    def build_query(self, raw_query):
        query = {}
        return query

    def run(self):
        while True:
            q = redis_store.blpop("search_triple")
