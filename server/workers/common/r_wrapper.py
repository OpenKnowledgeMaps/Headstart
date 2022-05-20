import os
import sys
import copy
import json
import redis
import logging


formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')


class RWrapper(object):

    def __init__(self, wd="./", script="", redis_store=None,
                 language=None,
                 loglevel="INFO"):
        # path should be to where in the docker container the Rscript are
        self.wd = wd
        self.command = 'Rscript'
        self.runner = os.path.abspath(os.path.join(self.wd, script))
        self.redis_store = redis_store
        self.default_params = {}
        self.default_params["language"] = language
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(loglevel)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        handler.setLevel(loglevel)
        self.logger.addHandler(handler)

    def add_default_params(self, params):
        default_params = copy.deepcopy(self.default_params)
        default_params.update(params)
        return default_params

    def next_item(self):
        raise NotImplementedError

    def execute_search(self, params):
        raise NotImplementedError

    def run(self):
        while True:
            k, params, endpoint = self.next_item()
            self.logger.debug(k)
            self.logger.debug(params)
            if endpoint == "search":
                try:
                    res = {}
                    res["id"] = k
                    res["input_data"] = self.execute_search(params)
                    res["params"] = params
                    if params.get('raw') is True:
                        redis_store.set(k+"_output", json.dumps(res))
                    else:
                        redis_store.rpush("input_data", json.dumps(res).encode('utf8'))
                except Exception as e:
                    self.logger.error(e)
                    self.logger.error(params)
