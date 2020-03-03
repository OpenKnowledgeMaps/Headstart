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
