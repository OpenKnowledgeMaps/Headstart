import os
import redis

from flask import Blueprint, make_response


redis_store = redis.StrictRedis(host="localhost", port=6379, db=0)
app = Blueprint('v2', __name__)
