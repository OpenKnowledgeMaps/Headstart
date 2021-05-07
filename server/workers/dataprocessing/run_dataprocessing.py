import os
import json
import redis
from dataprocessing.src.headstart import Dataprocessing


if __name__ == '__main__':
    with open("redis_config.json") as infile:
        redis_config = json.load(infile)
    redis_config["host"] = os.getenv("REDIS_HOST")
    print(redis_config)

    redis_store = redis.StrictRedis(**redis_config)
    dp = Dataprocessing("./other-scripts", "run_vis_layout.R",
                        redis_store=redis_store,
                        loglevel=os.environ.get("HEADSTART_LOGLEVEL", "INFO"))
    dp.run()
