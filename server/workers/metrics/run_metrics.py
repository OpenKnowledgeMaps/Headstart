import os

# import json
import redis
from metrics.src.metrics import MetricsClient


if __name__ == "__main__":
    redis_config = {
        "host": os.getenv("REDIS_HOST"),
        "port": os.getenv("REDIS_PORT"),
        "db": os.getenv("REDIS_DB"),
        "password": os.getenv("REDIS_PASSWORD"),
        "client_name": "metrics_retrieval",
    }

    redis_store = redis.StrictRedis(**redis_config)
    wrapper = MetricsClient(
        "./other-scripts",
        "run_metrics.R",
        redis_store,
        "english",
        os.environ.get("LOGLEVEL", "INFO"),
    )
    wrapper.run()
