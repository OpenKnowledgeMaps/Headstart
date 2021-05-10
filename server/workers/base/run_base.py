import os
import json
import redis
from base.src.base import BaseClient


if __name__ == '__main__':
    redis_config = {
        "host": os.getenv("REDIS_HOST"),
        "port": os.getenv("REDIS_PORT"),
        "db": os.getenv("REDIS_DB"),
        "password": os.getenv("REDIS_PASSWORD")
    }

    redis_store = redis.StrictRedis(**redis_config)
    wrapper = BaseClient("./other-scripts", "run_base.R", redis_store,
                         "english",
                         os.environ.get("BASE_LOGLEVEL", "INFO"))
    wrapper.run()
