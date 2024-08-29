import logging

import redis

from config import LOGGING_CONFIG, REDIS_CONFIG, ORCID_CONFIG
from common.rate_limiter import RateLimiter
from orcid_service import OrcidService
from worker import OrcidWorker

def setup_logging():
    logging.basicConfig(
        level=LOGGING_CONFIG["level"],
        format=LOGGING_CONFIG["format"],
        datefmt=LOGGING_CONFIG["datefmt"]
    )
    logger = logging.getLogger(__name__)
    logger.info("Logging is configured.")
    return logger

def create_redis_store():
    redis_store = redis.StrictRedis(**REDIS_CONFIG)
    return redis_store

def create_data_retriever(redis_store: redis.StrictRedis):
    data_retriever = OrcidService.create(
        orcid_client_id=ORCID_CONFIG['client_id'],
        orcid_client_secret=ORCID_CONFIG['client_secret'],
        sandbox=ORCID_CONFIG['sandbox'],
        redis_store=redis_store
    )
    return data_retriever

def main():
    # Set up logging
    logger = setup_logging()

    # Set up Redis
    redis_store = create_redis_store()

    # Initialize ORCID data retriever
    data_retriever = create_data_retriever(redis_store)

    rate_limiter = RateLimiter(redis_store, "orcid-ratelimit")

    # Initialize the worker
    worker = OrcidWorker(redis_store, data_retriever, rate_limiter)

    logger.info("Starting ORCID worker")
    worker.run()

if __name__ == "__main__":
    main()