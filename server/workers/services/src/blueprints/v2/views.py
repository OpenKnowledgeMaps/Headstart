import os
import redis
import asyncio

from flask import Blueprint, request, make_response, jsonify


redis_store = redis.StrictRedis(host="localhost", port=6379, db=0)
app = Blueprint('v2', __name__)


@app.route('/api/v2/search_triple', methods=['GET', 'POST'])
def search_triple():
    """
    """
    if request.method == "POST":
        redis_store.rpush("search_triple")
        result = await redis_store.get(k)


@app.route('/api/v2/example_data', methods=['GET', 'POST'])
def example_data():
    headers = {"Content-Type": "application/json"}
    data = {"test": "document string"}
    return make_response(data,
                         200,
                         headers)
