import os
import json
import redis
from openaire.src.openaire import OpenAIREClient


if __name__ == '__main__':
    redis_config = {
        "host": os.getenv("REDIS_HOST"),
        "port": os.getenv("REDIS_PORT"),
        "db": os.getenv("REDIS_DB"),
        "password": os.getenv("REDIS_PASSWORD")
    }
    redis_store = redis.StrictRedis(**redis_config)
    wrapper = OpenAIREClient("./other-scripts", "run_openaire.R", redis_store,
                           "english",
                           os.environ.get("OPENAIRE_LOGLEVEL", "INFO"))
    wrapper.run()
