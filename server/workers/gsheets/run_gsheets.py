import os
import json
import redis
from gsheets.src.search_gsheets import GSheetsClient


if __name__ == '__main__':
    redis_config = {
        "host": os.getenv("REDIS_HOST"),
        "port": os.getenv("REDIS_PORT"),
        "db": os.getenv("REDIS_DB"),
        "password": os.getenv("REDIS_PASSWORD"),
        "client_name": "gsheets_retrieval"
    }
    redis_store = redis.StrictRedis(**redis_config)
    gc = GSheetsClient(redis_store, os.environ.get("LOGLEVEL", "INFO"))
    gc.run()
