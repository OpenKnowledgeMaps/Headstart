import os
import json
import redis
from gsheets.src.search_gsheets import GSheetsClient


if __name__ == '__main__':
    with open("redis_config.json") as infile:
        redis_config = json.load(infile)
    redis_config["host"] = os.getenv("REDIS_HOST")

    redis_store = redis.StrictRedis(**redis_config)
    gc = GSheetsClient(redis_store, os.environ.get("GSHEETS_LOGLEVEL", "INFO"))
    gc.run()
