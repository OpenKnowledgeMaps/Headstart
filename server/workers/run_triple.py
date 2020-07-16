import os
import json
import redis
from triple.src.search_triple import TripleClient


if __name__ == '__main__':
    with open("es_config.json") as infile:
        es_config = json.load(infile)
    with open("redis_config.json") as infile:
        redis_config = json.load(infile)

    redis_store = redis.StrictRedis(**redis_config)
    tc = TripleClient(es_config, redis_store, os.environ["TRIPLE_LOGLEVEL"])
    tc.run()
