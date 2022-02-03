import os
import json
import redis
from triple.src.search_triple import TripleClient


if __name__ == '__main__':
    es_config = {
        "user": os.getenv("TRIPLE_USER"),
        "pass": os.getenv("TRIPLE_PASS"),
        "host": os.getenv("TRIPLE_HOST"),
        "port": os.getenv("TRIPLE_PORT")
    }
    redis_config = {
        "host": os.getenv("REDIS_HOST"),
        "port": os.getenv("REDIS_PORT"),
        "db": os.getenv("REDIS_DB"),
        "password": os.getenv("REDIS_PASSWORD"),
        "client_name": "triple_retrieval"
    }

    redis_store = redis.StrictRedis(**redis_config)
    tc = TripleClient(es_config, redis_store, os.environ.get("LOGLEVEL", "INFO"))
    tc.run()
