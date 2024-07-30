import os
import json
import subprocess
import pandas as pd
import logging
from datetime import timedelta
from common.r_wrapper import RWrapper
from common.decorators import error_logging_aspect
    
import re
from redis.exceptions import LockError
import time
import numpy as np

formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')


class MetricsClient(RWrapper):

    def __init__(self, *args):
        super().__init__(*args)
        # set separation for requests
        # respecting rate limit of 1 qps
        # separation = round(period_in_seconds / rate limit per second)
        self.separation = 1.5
        self.rate_key = 'metrics-ratelimit'

    def next_item(self):
        queue, msg = self.redis_store.blpop("metrics")
        msg = json.loads(msg.decode('utf-8'))
        k = msg.get('id')
        params = self.add_default_params(msg.get('params'))
        metadata = msg.get('metadata')
        return k, params, metadata

    def metrics_rate_limit_reached(self):
        """
        This implementation is inspired by an implementation of
        Generic Cell Rate Algorithm based rate limiting,
        seen on https://dev.to/astagi/rate-limiting-using-python-and-redis-58gk.
        It has been simplified and adjusted to our use case.

        BASE demands one request per second (1 QPS), per
        https://www.base-search.net/about/download/base_interface.pdf
        """
        
        t = self.redis_store.time()[0]
        self.redis_store.setnx(self.rate_key, 0)
        try:
            with self.redis_store.lock('lock:' + self.rate_key, blocking_timeout=5) as lock:
                theoretical_arrival_time = max(float(self.redis_store.get(self.rate_key)), t)
                if theoretical_arrival_time - t <= 0:
                    new_theoretical_arrival_time = max(theoretical_arrival_time, t) + self.separation
                    self.redis_store.set(self.rate_key, new_theoretical_arrival_time)
                    return False
                return True
        # the locking mechanism is needed if a key is requested multiple times at the same time
        except LockError:
            return True

    @error_logging_aspect(log_level=logging.ERROR)
    def execute_search(self, params: dict, metadata: pd.DataFrame) -> dict:
        q = params.get('q')
        service = params.get('service')
        data = {}
        data["params"] = params
        data["metadata"] = metadata
        cmd = [self.command, self.runner, self.wd,
               q, service]
        try:
            proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                    encoding='utf-8')
            stdout, stderr = proc.communicate(json.dumps(data))
            output = [o for o in stdout.split('\n') if len(o) > 0]
            error = [o for o in stderr.split('\n') if len(o) > 0]
            raw_metadata = json.loads(output[-2])
            if isinstance(raw_metadata, dict) and raw_metadata.get('status') == "error":
                res = raw_metadata
            else:
                metadata = pd.DataFrame(raw_metadata)
            return res
        except Exception as e:
            self.logger.error(e)
            self.logger.error(error)
            raise

    @error_logging_aspect(log_level=logging.ERROR)
    def run(self):
        while True:
            while self.metrics_rate_limit_reached():
                self.logger.debug('🛑 Request is limited')
                time.sleep(0.1)
            k, params, metadata = self.next_item()
            self.logger.debug(k)
            self.logger.debug(params)
            try:
                res = self.execute_search(params, metadata)
                res["id"] = k
                if res.get("status") == "error" or params.get('raw') is True:
                    self.redis_store.set(k+"_output", json.dumps(res))                        
                else:
                    self.redis_store.set(k+"_output", json.dumps(res))                   
            except Exception as e:
                self.logger.exception("Exception during metrics enrichment.")
                self.logger.error(params)
                self.logger.error(e)