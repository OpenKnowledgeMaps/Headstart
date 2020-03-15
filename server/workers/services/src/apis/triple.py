import os
import json
import uuid
import time
import redis
import asyncio
import aioredis

from flask import Blueprint, request, make_response, jsonify, abort
from flask_restx import Namespace, Resource, fields
from .request_validators import SearchParamSchema

redis_store = redis.StrictRedis(host="localhost", port=6379, db=0)
api = Namespace("triple", description="TRIPLE API")
search_param_schema = SearchParamSchema()


def get_key(store, key):
    while True:
        res = redis_store.get(key+"_output")
        if res is None:
            time.sleep(0.5)
        else:
            result = json.loads(res.decode('utf-8'))
            redis_store.delete(key)
            redis_store.delete(key+"_output")
            break
    return result


@api.model(fields={"q": fields.String,
                   "sorting": fields.String,
                   "from_": fields.String,
                   "to": fields.String,
                   "vis_type": fields.String,
                   "raw": fields.Boolean})
class SearchQuery(fields.Raw):
    def format(self, value):
        return {"q": value.q,
                "sorting": value.sorting,
                "from": getattr(value, "from"),
                "to": value.to,
                "vis_type": value.vis_type,
                "raw": value.raw}


@api.route('/search')
class Search(Resource):
    @api.doc(responses={200: 'OK',
                        400: 'Invalid search parameters'},
             params={"q": "string, query term",
                     "sorting": "string, most-relevant or most-recent",
                     "from": "yyyy-MM-dd",
                     "to": "yyyy-MM-dd",
                     "vis_type": "string, overview or streamgraph",
                     "raw": "boolean"})
    def post(self):
        """
        """
        data = request.get_json()
        errors = search_param_schema.validate(data, partial=True)
        if errors:
            abort(400, str(errors))
        k = str(uuid.uuid4())
        d = {"id": k, "params": data,
             "endpoint": "search"}
        redis_store.rpush("triple", json.dumps(d))
        result = get_key(redis_store, k)

        headers = {"Content-Type": "application/json"}
        return make_response(result,
                             200,
                             headers)


@api.route('/example_data')
class ExampleData(Resource):
    def get(self):
        headers = {"Content-Type": "application/json"}
        data = {"test": "document string"}
        return make_response(data,
                             200,
                             headers)


@api.route('/mappings')
class Mappings(Resource):
    @api.doc(responses={200: 'OK',
                        400: 'Invalid search parameters'},
             params={"index": "Specify the ElasticSearch index to get the mapping of."})
    # @api.marshal_with(mappings)
    def get(self):
        """
        """
        data = {"index": request.args.get('index')}
        k = str(uuid.uuid4())
        d = {"id": k, "params": data, "endpoint": "mappings"}
        redis_store.rpush("triple", json.dumps(d))
        result = get_key(redis_store, k)

        headers = {"Content-Type": "application/json"}
        return make_response(result,
                             200,
                             headers)
