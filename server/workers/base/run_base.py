import logging

import os

from config import LOGGING_CONFIG, REDIS_CONFIG
import redis
from base.src.base import BaseClient

def setup_logging():
    logging.basicConfig(
        level=LOGGING_CONFIG["level"],
        format=LOGGING_CONFIG["format"],
        datefmt=LOGGING_CONFIG["datefmt"]
    )
    logger = logging.getLogger(__name__)
    logger.info("Logging is configured.")
    return logger


if __name__ == "__main__":
    redis_store = redis.StrictRedis(**REDIS_CONFIG)
    wrapper = BaseClient(
        "./other-scripts",
        "run_base.R",
        redis_store,
        "english",
        os.environ.get("LOGLEVEL", "INFO"),
    )
    wrapper.run()
