import os
import json
import redis
from pubmed.src.pubmed import PubMedClient


if __name__ == '__main__':
    with open("redis_config.json") as infile:
        redis_config = json.load(infile)

    redis_store = redis.StrictRedis(**redis_config)
    wrapper = PubMedClient("./other-scripts", "run_pubmed.R", redis_store,
                           "english",
                           os.environ["PUBMED_LOGLEVEL"])
    wrapper.run()
