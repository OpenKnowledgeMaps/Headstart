import os
import sys
import copy
import json
import time
import subprocess
import pandas as pd
import logging

from redis import RedisError
from .streamgraph import Streamgraph


formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')
sg = Streamgraph(loglevel=os.environ.get("LOGLEVEL", "INFO"))


class Dataprocessing(object):

    def __init__(self, wd="./", script="", redis_store=None,
                 language=None,
                 loglevel="INFO"):
        # path should be to where in the docker container the Rscript are
        self.wd = wd
        self.command = 'Rscript'
        self.hs = os.path.abspath(os.path.join(self.wd, script))
        self.redis_store = redis_store
        self.default_params = {}
        self.default_params["MAX_CLUSTERS"] = 15
        self.default_params["language"] = "english"
        self.default_params["taxonomy_separator"] = ";"
        self.default_params["list_size"] = -1
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(loglevel)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        handler.setLevel(loglevel)
        self.logger.addHandler(handler)
        self.tunnel_open = False

    def add_default_params(self, params):
        default_params = copy.deepcopy(self.default_params)
        default_params.update(params)
        return default_params

    def next_item(self):
        queue, msg = self.redis_store.blpop("input_data")
        msg = json.loads(msg.decode('utf-8'))
        k = msg.get('id')
        params = self.add_default_params(msg.get('params'))
        input_data = msg.get('input_data')
        return k, params, input_data

    def execute_search(self, params, input_data):
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
        error = [o.encode('ascii', errors='replace').decode() for o in stderr.split('\n') if len(o) > 0]
        self.logger.debug(error)
        try:
            res = pd.DataFrame(json.loads(output[-1])).to_json(orient="records")
            return res
        except Exception as e:
            self.logger.error(e)
            self.logger.error(error)
            raise

    def run(self):
        while not self.tunnel_open:
            try:
                self.redis_store.ping()
                self.tunnel_open = True
            except (RedisError, ConnectionRefusedError):
                self.logger.info("SSH tunnel still closed, retrying again in 30 seconds.")
                time.sleep(30)
        while self.tunnel_open:
            try:
                k, params, input_data = self.next_item()
                self.logger.debug(k)
                self.logger.debug(params)
            except (RedisError, ConnectionRefusedError):
                self.tunnel_open = False
                self.logger.error("Could not connect to remote Redis server, is the SSH tunnel open?")
            try:
                if params.get('vis_type') == "timeline":
                    metadata = self.execute_search(params, input_data)
                    sg_data = sg.get_streamgraph_data(json.loads(metadata),
                                                    params.get('q'),
                                                    params.get('top_n', 12),
                                                    params.get('sg_method', "count"))
                    res = {}
                    res["data"] = sg.reduce_metadata_set(metadata, sg_data)
                    res["streamgraph"] = json.dumps(sg_data)
                    res["status"] = "success"
                    self.redis_store.set(k+"_output", json.dumps(res))
                else:
                    res = self.execute_search(params, input_data)
                    self.redis_store.set(k+"_output", json.dumps(res))
            except ValueError as e:
                self.logger.error(params)
                self.logger.exception("Exception during visualization creation, probably not enough documents.")
                res = {}
                res["id"] = k
                res["params"] = params
                res["status"] = "error"
                res["reason"] = []
                self.redis_store.set(k+"_output", json.dumps(res))
            except Exception as e:
                self.logger.error(params)
                self.logger.exception("Exception during visualization creation.")
                res = {}
                res["id"] = k
                res["params"] = params
                res["status"] = "error"
                res["reason"] = "unexpected data processing error"
                self.redis_store.set(k+"_output", json.dumps(res))
