import os
import json
import subprocess
import pandas as pd
import logging
from common.r_wrapper import RWrapper

formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')


class OpenAIREClient(RWrapper):

    def next_item(self):
        queue, msg = self.redis_store.blpop("openaire")
        msg = json.loads(msg.decode('utf-8'))
        k = msg.get('id')
        params = self.add_default_params(msg.get('params'))
        params["service"] = "openaire"
        endpoint = msg.get('endpoint')
        return k, params, endpoint

    def execute_search(self, params):
        q = params.get('acronym', params.get('project_id'))
        if isinstance(q, list) and len(list(filter(None, q))) == 0:
            q = params.get('project_id')
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
    
    def get_projectdata(self, params):
        runner = os.path.abspath(os.path.join(self.wd, "run_openaire_projectdata.R"))
        project_id = params.get('project_id')
        funder = params.get('funder')
        cmd = [self.command, runner, self.wd, project_id, funder]
        try:
            proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                    encoding='utf-8')
            stdout, stderr = proc.communicate()
            output = [o for o in stdout.split('\n') if len(o) > 0]
            error = [o for o in stderr.split('\n') if len(o) > 0]
            raw = json.loads(output[-1])
            if isinstance(raw, dict) and raw.get('status') == "error":
                res = raw
            else:
                res = {}
                res["projectdata"] = raw
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
                        q_len = self.redis_store.llen("input_data")
                        self.logger.debug("Queue length: %s %d %s" %("input_data", q_len, k))
                except Exception as e:
                    self.logger.exception("Exception during data retrieval.")
                    self.logger.error(params)
                    self.logger.error(e)

            if endpoint == "projectdata":
                try:
                    res = self.get_projectdata(params.get('params'))
                    res["id"] = k
                    self.redis_store.set(k+"_output", json.dumps(res))
                except Exception as e:
                    self.logger.exception("Exception during retrieval of project data.")
                    self.logger.error(params)
                    self.logger.error(e)
                    self.logger.error(res)
