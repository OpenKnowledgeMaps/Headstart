import json
import subprocess
import pandas as pd
import logging
from common.r_wrapper import RWrapper


formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')


class BaseClient(RWrapper):

    def next_item(self):
        queue, msg = self.redis_store.blpop("base")
        msg = json.loads(msg.decode('utf-8'))
        k = msg.get('id')
        params = self.add_default_params(msg.get('params'))
        params["service"] = "base"
        endpoint = msg.get('endpoint')
        return k, params, endpoint

    def execute_search(self, params):
        q = params.get('q')
        service = params.get('service')
        data = {}
        data["params"] = params
        cmd = [self.command, self.runner, self.wd,
               q, service]
        try:
            proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                    encoding='utf-8')
            stdout, stderr = proc.communicate(json.dumps(data))
            output = [o for o in stdout.split('\n') if len(o) > 0]
            error = [o for o in stderr.split('\n') if len(o) > 0]
            raw_metadata = json.loads(output[-2])
            raw_text = json.loads(output[-1])
            if isinstance(raw_metadata, dict) and raw_metadata.get('status') == "error":
                res = raw_metadata
            else:
                metadata = pd.DataFrame(raw_metadata)
                text = pd.DataFrame(raw_text)
                input_data = {}
                input_data["metadata"] = metadata.to_json(orient='records')
                input_data["text"] = text.to_json(orient='records')
                res = {}
                res["input_data"] = input_data
                res["params"] = params
            return res
        except Exception as e:
            self.logger.error(e)
            self.logger.error(error)
            raise

    def get_contentproviders(self):
        cmd = [self.command, "run_base_contentproviders.R", self.wd]
        try:
            proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                    encoding='utf-8')
            stdout, stderr = proc.communicate(json.dumps({}))
            output = [o for o in stdout.split('\n') if len(o) > 0]
            error = [o for o in stderr.split('\n') if len(o) > 0]
            raw = json.loads(output[-1])
            if isinstance(raw, dict) and raw.get('status') == "error":
                res = raw
            else:
                contentproviders = pd.DataFrame(raw)
                res = {}
                res["contentproviders"] = contentproviders
            return res
        except Exception as e:
            self.logger.error(e)
            self.logger.error(error)

    def run(self):
        while True:
            k, params, endpoint = self.next_item()
            self.logger.debug(k)
            self.logger.debug(params)
            if endpoint == "search":
                try:
                    res = self.execute_search(params)
                    res["id"] = k
                    if res.get("status") == "error" or params.get('raw') is True:
                        self.redis_store.set(k+"_output", json.dumps(res))
                    else:
                        self.redis_store.rpush("input_data", json.dumps(res).encode('utf8'))
                except Exception as e:
                    self.logger.exception("Exception during data retrieval.")
                    self.logger.error(params)

            if endpoint == "contentproviders":
                try:
                    res = self.get_contentproviders()
                    res["id"] = k
                    if res.get("status") == "error" or params.get('raw') is True:
                        self.redis_store.set(k+"_output", json.dumps(res))
                    else:
                        self.redis_store.rpush("input_data", json.dumps(res).encode('utf8'))
                except Exception as e:
                    self.logger.exception("Exception during retrieval of contentproviders.")
                    self.logger.error(params)

