import os
import json
import redis
from dataprocessing.src.headstart import Dataprocessing


if __name__ == '__main__':
    redis_config = {
        "host": os.getenv("REDIS_HOST"),
        "port": os.getenv("REDIS_PORT"),
        "db": os.getenv("REDIS_DB"),
        "password": os.getenv("REDIS_PASSWORD"),
        "client_name": "dataprocessing"
    }

    redis_store = redis.StrictRedis(**redis_config)
    dp = Dataprocessing("./other-scripts", "run_vis_layout.R",
                        redis_store=redis_store,
                        loglevel=os.environ.get("LOGLEVEL", "INFO"))
    dp.run()
