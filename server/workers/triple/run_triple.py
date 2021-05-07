import os
import json
import redis
from triple.src.search_triple import TripleClient


if __name__ == '__main__':
    with open("es_config.json") as infile:
        es_config = json.load(infile)
    with open("redis_config.json") as infile:
        redis_config = json.load(infile)
    redis_config["host"] = os.getenv("REDIS_HOST")

    redis_store = redis.StrictRedis(**redis_config)
    tc = TripleClient(es_config, redis_store, os.environ.get("TRIPLE_LOGLEVEL", "INFO"))
    tc.run()
