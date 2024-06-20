import os
# import json
import redis
from orcid.src.orcid import OrcidClient


if __name__ == '__main__':
    redis_config = {
        "host": os.getenv("REDIS_HOST"),
        "port": os.getenv("REDIS_PORT"),
        "db": os.getenv("REDIS_DB"),
        "password": os.getenv("REDIS_PASSWORD"),
        "client_name": "orcid_retrieval"
    }

    redis_store = redis.StrictRedis(**redis_config)
    wrapper = OrcidClient(None, None, redis_store,
                         "english",
                         os.environ.get("LOGLEVEL", "INFO"))
    wrapper.run()
