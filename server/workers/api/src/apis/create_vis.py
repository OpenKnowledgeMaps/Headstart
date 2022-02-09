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
from apis.utils import get_key
from apis.base import base_querymodel


vis_ns = Namespace("vis", description="Head Start data processing operations")

redis_config = {
    "host": os.getenv("REDIS_HOST"),
    "port": os.getenv("REDIS_PORT"),
    "db": os.getenv("REDIS_DB"),
    "password": os.getenv("REDIS_PASSWORD")
}
redis_store = redis.StrictRedis(**redis_config)

input_model = vis_ns.model("InputModel",
                            {"params": fields.Nested(base_querymodel),
                             "input_data": fields.String()})


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
        k = str(uuid.uuid4())
        d = {"id": k, "params": params,
             "input_data": input_data}
        redis_store.rpush("input_data", json.dumps(d).encode('utf8'))
        result = get_key(redis_store, k)
        try:
            headers = {}
            if request.headers["Accept"] == "application/json":
                headers["Content-Type"] = "application/json"
            if request.headers["Accept"] == "text/csv":
                if params.get("raw") is True:
                    df = pd.read_json(json.loads(result))
                    result = df.to_csv()
                else:
                    result = pd.read_json(json.loads(result)).to_csv()
                headers["Content-Type"] = "text/csv"
                headers["Content-Disposition"] = "attachment; filename={0}.csv".format(k)
            return make_response(result,
                                 200,
                                 headers)
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

