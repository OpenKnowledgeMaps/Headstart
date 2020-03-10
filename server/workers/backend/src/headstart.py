import os
import copy
import json
import subprocess
from tempfile import NamedTemporaryFile
import redis

redis_store = redis.StrictRedis(host="localhost", port=6379, db=0)


class Backend(object):

    def __init__(self):
        # path should be to where in the docker container the Rscript are
        self.wd = "./"
        self.command = 'Rscript'
        self.hs = os.path.abspath(os.path.join(self.wd, "run_vis_layout.R"))
        self.default_params = {}
        self.default_params["MAX_CLUSTERS"] = 15
        self.default_params["language"] = "english"
        self.default_params["taxonomy_separator"] = ";"
        self.default_params["list_size"] = 100

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
        with NamedTemporaryFile(mode='w+', suffix='.json') as param_file:
            with NamedTemporaryFile(mode='w+', suffix='.json') as input_file:
                json.dump(params, param_file)
                param_file.flush()
                json.dump(input_data, input_file)
                input_file.flush()
                cmd = [self.command, self.hs, self.wd,
                       params.get('q'), params.get('service'),
                       param_file.name, input_file.name]
                print(cmd)
                output = subprocess.check_output(cmd)
        output = [o for o in output.decode('utf-8').split('\n') if len(o) > 0]
        return output[-1]

    def run(self):
        while True:
            k, params, input_data = self.next_item()
            output = self.create_map(params, input_data)
            redis_store.set(k+"_output", output)


if __name__ == '__main__':
    hsb = Backend()
    hsb.run()
