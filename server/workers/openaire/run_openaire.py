import os
import json
import redis
from openaire.src.openaire import OpenAIREClient


if __name__ == '__main__':
    redis_config = {
        "host": os.getenv("REDIS_HOST"),
        "port": os.getenv("REDIS_PORT"),
        "db": os.getenv("REDIS_DB"),
        "password": os.getenv("REDIS_PASSWORD"),
        "client_name": "openaire_retrieval",
        "ssl": True if os.getenv("REDIS_SSL") == "true" else False
    }
    redis_store = redis.StrictRedis(**redis_config)
    wrapper = OpenAIREClient("./other-scripts", "run_openaire.R", redis_store,
                           "english",
                           os.environ.get("LOGLEVEL", "INFO"))
    wrapper.run()
