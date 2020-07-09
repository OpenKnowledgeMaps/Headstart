import os
import sys
import copy
import json
import subprocess
from tempfile import NamedTemporaryFile
import redis
import pandas as pd
import logging


formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')


class BaseClient(object):

    def __init__(self, wd="./"):
        # path should be to where in the docker container the Rscript are
        self.wd = wd
        self.command = 'Rscript'
        self.hs = os.path.abspath(os.path.join(self.wd, "run_base.R"))
        self.default_params = {}
        self.default_params["language"] = "english"
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(os.environ["BASE_LOGLEVEL"])
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        handler.setLevel(os.environ["BASE_LOGLEVEL"])
        self.logger.addHandler(handler)

    def add_default_params(self, params):
        default_params = copy.deepcopy(self.default_params)
        default_params.update(params)
        return default_params

    def next_item(self):
        queue, msg = redis_store.blpop("base")
        msg = json.loads(msg.decode('utf-8'))
        k = msg.get('id')
        params = self.add_default_params(msg.get('params'))
        params["service"] = "base"
        endpoint = msg.get('endpoint')
        return k, params, endpoint

    def search(self, params):
        q = params.get('q')
        service = params.get('service')
        data = {}
        data["params"] = params
        cmd = [self.command, self.hs, self.wd,
               q, service]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                encoding="utf-8")
        stdout, stderr = proc.communicate(json.dumps(data))
        output = [o for o in stdout.split('\n') if len(o) > 0]
        error = [o for o in stderr.split('\n') if len(o) > 0]
        return pd.DataFrame(json.loads(output[-1])).to_json(orient="records")

    def run(self):
        while True:
            k, params, input_data = self.next_item()
            self.logger.debug(k)
            self.logger.debug(params)
            if endpoint == "search":
                try:
                    res = {}
                    res["id"] = k
                    res["input_data"] = self.search(params)
                    res["params"] = params
                    if params.get('raw') is True:
                        redis_store.set(k+"_output", json.dumps(res))
                    else:
                        redis_store.rpush("input_data", json.dumps(res))


if __name__ == '__main__':
    with open("redis_config.json") as infile:
        redis_config = json.load(infile)

    redis_store = redis.StrictRedis(**redis_config)
    base = BaseClient()
    base.run()
