import os
import json
import redis
from triple.src.search_triple import TripleClient


if __name__ == '__main__':
    with open("es_config.json") as infile:
        es_config = json.load(infile)
    redis_config = {
        "host": os.getenv("REDIS_HOST"),
        "port": os.getenv("REDIS_PORT"),
        "db": os.getenv("REDIS_DB"),
        "password": os.getenv("REDIS_PASSWORD")
    }

    redis_store = redis.StrictRedis(**redis_config)
    tc = TripleClient(es_config, redis_store, os.environ.get("TRIPLE_LOGLEVEL", "INFO"))
    tc.run()
