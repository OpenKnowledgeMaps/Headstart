import os
import sys
import copy
import json
import subprocess
from tempfile import NamedTemporaryFile
import redis
import pandas as pd
import logging

from streamgraph import get_streamgraph_data


formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')


class Dataprocessing(object):

    def __init__(self, wd="./"):
        # path should be to where in the docker container the Rscript are
        self.wd = wd
        self.command = 'Rscript'
        self.hs = os.path.abspath(os.path.join(self.wd, "run_vis_layout.R"))
        self.default_params = {}
        self.default_params["MAX_CLUSTERS"] = 15
        self.default_params["language"] = "english"
        self.default_params["taxonomy_separator"] = ";"
        self.default_params["list_size"] = -1
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(os.environ["HEADSTART_LOGLEVEL"])
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        handler.setLevel(os.environ["HEADSTART_LOGLEVEL"])
        self.logger.addHandler(handler)

    def add_default_params(self, params):
        default_params = copy.deepcopy(self.default_params)
        default_params.update(params)
        return default_params

    def next_item(self):
        queue, msg = redis_store.blpop("input_data")
        msg = json.loads(msg.decode('utf-8'))
        k = msg.get('id')
        params = self.add_default_params(msg.get('params'))
        input_data = msg.get('input_data')
        return k, params, input_data

    def create_map(self, params, input_data):
        q = params.get('q')
        service = params.get('service')
        data = {}
        data["input_data"] = input_data
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
            if params.get('vis_type') == "timeline":
                metadata = self.create_map(params, input_data)
                sg_data = get_streamgraph_data(json.loads(metadata), params.get('top_n', 12), params.get('sg_method'))
                result = {}
                result["data"] = metadata
                result["streamgraph"] = json.dumps(sg_data)
                redis_store.set(k+"_output", json.dumps(result))
            else:
                result = self.create_map(params, input_data)
                redis_store.set(k+"_output", json.dumps(result))


if __name__ == '__main__':
    with open("redis_config.json") as infile:
        redis_config = json.load(infile)

    redis_store = redis.StrictRedis(**redis_config)
    hsb = Dataprocessing()
    hsb.run()
