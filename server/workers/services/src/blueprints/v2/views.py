import os
import redis

from flask import Blueprint, make_response


redis_store = redis.StrictRedis(host="localhost", port=6379, db=0)
app = Blueprint('v2', __name__)


@app.route('/api/v2/search_triple', methods=['GET', 'POST'])
def search_triple():
    """
    """



@app.route('/api/v2/example_data', methods=['GET', 'POST'])
def example_data():
    headers = {"Content-Type": "application/json"}
    data = {"test": "document string"}
    return make_response(data,
                         200,
                         headers)
