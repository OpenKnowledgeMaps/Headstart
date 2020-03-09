import os
import time
import json
import subprocess
from tempfile import TemporaryFile
import redis

redis_store = redis.StrictRedis(host="localhost", port=6379, db=0)


class Backend(object):

    def __init__(self):
        # path should be to where in the docker container the Rscript are
        self.wd = "headstart"
        self.command = 'Rscript'
        self.hs = os.path.join(self.wd, "run_vis_layout.R")

    def next_item(self):
        queue, msg = redis_store.blpop("input_data")
        msg = json.loads(msg)
        k = msg.get('id')
        input_data = msg.get('input_data')
        return k, input_data

    def create_map(self, input_data):
        with TemporaryFile() as input:
            cmd = [self.command, self.hs, input]
            output = subprocess.check_output(cmd)
        output = [o for o in output.decode('utf-8').split('\n') if len(o) > 0]
        return output[-1]

    def run(self):
        while True:
            k, input_data = self.next_item()
            output = self.create_map(input_data)
            redis_store.set(k+"_output", output)


if __name__ == '__main__':
    hsb = Backend()
    hsb.run()
