import os
import json
import redis
from pubmed.src.pubmed import PubMedClient


if __name__ == '__main__':
    redis_config = {
        "host": os.getenv("REDIS_HOST"),
        "port": os.getenv("REDIS_PORT"),
        "db": os.getenv("REDIS_DB"),
        "password": os.getenv("REDIS_PASSWORD"),
        "client_name": "pubmed_retrieval",
        "ssl": True if os.getenv("REDIS_SSL") == "true" else False
    }
    redis_store = redis.StrictRedis(**redis_config)
    wrapper = PubMedClient("./other-scripts", "run_pubmed.R", redis_store,
                           "english",
                           os.environ.get("LOGLEVEL", "INFO"))
    wrapper.run()
