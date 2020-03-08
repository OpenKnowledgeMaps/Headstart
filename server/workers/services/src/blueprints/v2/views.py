import os
import json
import uuid
import time
import redis
import asyncio
import aioredis

from flask import Blueprint, request, make_response, jsonify


redis_store = redis.StrictRedis(host="localhost", port=6379, db=0)
app = Blueprint('v2', __name__)


def get_key(store, key):
    while True:
        res = redis_store.get(key)
        if res is None:
            time.sleep(0.5)
        else:
            result = json.loads(res.decode('utf-8'))
            redis_store.delete(key)
            break
    return result


@app.route('/api/v2/triple/search', methods=['POST'])
def triple_search():
    """
    """
    data = request.get_json()
    print(data)
    k = str(uuid.uuid4())
    d = {"id": k, "data": data, "endpoint": "search"}
    redis_store.rpush("triple", json.dumps(d))
    result = get_key(redis_store, k)

    headers = {"Content-Type": "application/json"}
    return make_response(result,
                         200,
                         headers)


@app.route('/api/v2/triple/mappings', methods=['GET'])
def triple_mappings():
    """
    """
    data = {"index": request.args.get('index')}
    k = str(uuid.uuid4())
    d = {"id": k, "data": data, "endpoint": "mappings"}
    redis_store.rpush("triple", json.dumps(d))
    result = get_key(redis_store, k)

    headers = {"Content-Type": "application/json"}
    return make_response(result,
                         200,
                         headers)


@app.route('/api/v2/example_data', methods=['GET', 'POST'])
def example_data():
    headers = {"Content-Type": "application/json"}
    data = {"test": "document string"}
    return make_response(data,
                         200,
                         headers)
