import json
import logging
from common.decorators import error_logging_aspect
import time
from typing import Tuple, Dict
from common.rate_limiter import RateLimiter
from redis import Redis
from services.orcid import OrcidService

class OrcidWorker:
    service = "orcid"

    logger = logging.getLogger(__name__)


    def __init__(
        self,
        redis_store: Redis,
        data_retriever: OrcidService,
        rate_limiter: RateLimiter,
    ) -> None:
        self.redis_store = redis_store
        self.data_retriever = data_retriever
        self.rate_limiter = rate_limiter

    def next_item(self) -> Tuple[str, Dict[str, str], str]:
        _, message = self.redis_store.blpop(self.service)
        try:
            message_data: dict = json.loads(message.decode("utf-8"))
        except (json.JSONDecodeError, AttributeError) as e:
            raise ValueError(f"Failed to decode message: {e}")

        request_id = message_data.get("id")
        params = message_data.get("params")
        params["service"] = self.service
        endpoint = message_data.get("endpoint")
        return request_id, params, endpoint

    @error_logging_aspect(log_level=logging.ERROR)
    def run(self) -> None:
        while True:
            while self.rate_limiter.rate_limit_reached():
                self.logger.debug("🛑 Request is limited")
                time.sleep(0.1)
            request_id, params, endpoint = self.next_item()
            self.logger.debug(request_id)
            self.logger.debug(params)
            if endpoint == "search":
                self.handle_search(request_id, params)

    def handle_search(self, request_id: str, params: dict) -> None:
        try:
            res = self.data_retriever.execute_search(params)
            res["id"] = request_id

            if res.get("status") == "error" or params.get("raw") is True:
                self.redis_store.set(request_id + "_output", json.dumps(res))
            else:
                self.redis_store.rpush("input_data", json.dumps(res).encode("utf8"))
                queue_length = self.redis_store.llen("input_data")
                self.logger.debug(f"Queue length: input_data {queue_length} {request_id}")
        except Exception as e:
            self.logger.exception("Exception during data retrieval.")
            self.logger.error(params)
            self.logger.error(e)