import os
import time
import json
import subprocess
import redis

redis_store = redis.StrictRedis(host="localhost", port=6379, db=0)


class Backend(object):

    def __init__(self):
        # path should be to where in the docker container the Rscript are
        self.wd = "headstart"
        self.command = 'Rscript'
        self.hs = os.path.join(self.wd, "run_vis_layout.R")

    def create_map(self, input_data):
        pass

    def run(self):
        while True:
            input_data = redis_store.blpop('input_data')
            self.create_map(input_data)


if __name__ == '__main__':
    hsb = Backend()
    hsb.run()
