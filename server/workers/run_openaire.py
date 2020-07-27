import os
import json
import redis
from openaire.src.openaire import OpenAIREClient


if __name__ == '__main__':
    with open("redis_config.json") as infile:
        redis_config = json.load(infile)

    redis_store = redis.StrictRedis(**redis_config)
    wrapper = OpenAIREClient("./other-scripts", "run_openaire.R", redis_store,
                           "english",
                           os.environ("OPENAIRE_LOGLEVEL", "INFO"))
    wrapper.run()
