import logging
from redis.exceptions import LockError
from redis import StrictRedis
from common.decorators import error_logging_aspect

class RateLimiter:
    """
    RateLimiter class to limit the number of requests to the ORCID API.
    """
    def __init__(self, redis_store: StrictRedis, rate_key, separation = 0.1):
        self.redis_store = redis_store
        self.rate_key = rate_key
        self.separation = separation

    @error_logging_aspect(log_level=logging.INFO)
    def rate_limit_reached(self) -> bool:
        """
        This implementation is inspired by an implementation of
        Generic Cell Rate Algorithm based rate limiting,
        seen on https://dev.to/astagi/rate-limiting-using-python-and-redis-58gk.
        It has been simplified and adjusted to our use case.

        ORCID allows 24 requests per second, with a burst limit of 40 requests. See also:
        https://info.orcid.org/ufaqs/what-are-the-api-limits/
        """
        
        t = self.redis_store.time()[0]
        self.redis_store.setnx(self.rate_key, 0)
        try:
            with self.redis_store.lock('lock:' + self.rate_key, blocking_timeout=5) as _:
                theoretical_arrival_time = max(float(self.redis_store.get(self.rate_key)), t)
                if theoretical_arrival_time - t <= 0:
                    new_theoretical_arrival_time = max(theoretical_arrival_time, t) + self.separation
                    self.redis_store.set(self.rate_key, new_theoretical_arrival_time)
                    return False
                return True
        # the locking mechanism is needed if a key is requested multiple times at the same time
        except LockError:
            return True