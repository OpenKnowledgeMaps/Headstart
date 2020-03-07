import os
import json
import uuid
import redis
import asyncio
import aioredis

from flask import Blueprint, request, make_response, jsonify


redis_store = redis.StrictRedis(host="localhost", port=6379, db=0)
app = Blueprint('v2', __name__)


async def get_key(store, key):
    result = await redis_store.get(key)
    return result


@app.route('/api/v2/search_triple', methods=['GET', 'POST'])
def search_triple():
    """
    """
    if request.method == "POST":
        data = request.get_json()
        k = str(uuid.uuid4())
        d = {"id": k, "data": data}
        redis_store.rpush("search_triple", json.dumps(d))
        result = get_key(redis_store, k)


@app.route('/api/v2/example_data', methods=['GET', 'POST'])
def example_data():
    headers = {"Content-Type": "application/json"}
    data = {"test": "document string"}
    return make_response(data,
                         200,
                         headers)
