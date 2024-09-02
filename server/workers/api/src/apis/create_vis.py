import os
import json
import uuid
import time
import redis
import asyncio
import aioredis
import pandas as pd

from flask import request, make_response, jsonify, abort
from flask_restx import Namespace, Resource, fields
from .request_validators import SearchParamSchema
from common.utils import get_key
from apis.base import base_querymodel


vis_ns = Namespace("vis", description="Head Start data processing operations")

redis_config = {
    "host": os.getenv("REDIS_HOST"),
    "port": os.getenv("REDIS_PORT"),
    "db": os.getenv("REDIS_DB"),
    "password": os.getenv("REDIS_PASSWORD")
}
redis_store = redis.StrictRedis(**redis_config)

input_model = vis_ns.model(
    "InputModel",
    {
        "params": fields.Nested(base_querymodel), 
        "input_data": fields.String()
    },
)

def set_response_headers(accept_header, is_raw, result, filename):
    headers = {}
    if accept_header == "application/json":
        headers["Content-Type"] = "application/json"
    elif accept_header == "text/csv":
        result = pd.read_json(json.loads(result)).to_csv() if is_raw else pd.read_json(json.loads(result)).to_csv()
        headers["Content-Type"] = "text/csv"
        headers["Content-Disposition"] = f"attachment; filename={filename}.csv"
    return result, headers

@vis_ns.route('/create')
class Create(Resource):
    @vis_ns.doc(responses={200: 'OK',
                              400: 'Invalid search parameters'})
    @vis_ns.expect(input_model)
    @vis_ns.produces(["application/json", "text/csv"])
    def post(self):
        """
        """
        data = request.get_json()
        params = data["params"]
        vis_ns.logger.debug(params)
        input_data = data["input_data"]
        request_id = str(uuid.uuid4())
        d = {"id": request_id, "params": params,
             "input_data": input_data}
        redis_store.rpush("input_data", json.dumps(d).encode('utf8'))
        q_len = redis_store.llen("input_data")
        vis_ns.logger.debug("Queue length: %s %d %s" %("input_data", q_len, request_id))
        result = get_key(redis_store, request_id)
        try:
            result, headers = set_response_headers(request.headers["Accept"], params.get("raw"), result, request_id)
            return make_response(result, 200, headers)
        except Exception as e:
            vis_ns.logger.error(e)
            abort(500, "Problem encountered, check logs.")


@vis_ns.route('/queue_length')
class ServiceVersion(Resource):
    def get(self):
        q_len = redis_store.llen("input_data")
        result = {"queue_length": q_len}
        return make_response(result, 200, {"Content-Type": "application/json"})

@vis_ns.route('/service_version')
class ServiceVersion(Resource):
    def get(self):
        result = {"service_version": os.getenv("SERVICE_VERSION")}
        return make_response(result, 200, {"Content-Type": "application/json"})

