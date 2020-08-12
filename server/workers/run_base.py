import os
import json
import redis
from base.src.base import BaseClient


if __name__ == '__main__':
    with open("redis_config.json") as infile:
        redis_config = json.load(infile)

    redis_store = redis.StrictRedis(**redis_config)
    wrapper = BaseClient("./other-scripts", "run_base.R", redis_store,
                         "english",
                         os.environ.get("BASE_LOGLEVEL", "INFO"))
    wrapper.run()
