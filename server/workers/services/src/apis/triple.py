import os
import json
import uuid
import time
import redis
import asyncio
import aioredis
import pandas as pd

from flask import Blueprint, request, make_response, jsonify, abort
from flask_restx import Namespace, Resource, fields
from .request_validators import SearchParamSchema

redis_store = redis.StrictRedis(host="localhost", port=6379, db=0)
triple_ns = Namespace("triple", description="TRIPLE API operations")


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


search_query = triple_ns.model("Search Query",
                               {"q": fields.String(required=True),
                                "sorting": fields.String(required=True),
                                "from": fields.String(required=True),
                                "to": fields.String(required=True),
                                "vis_type": fields.String(required=True),
                                "result_type": fields.String(required=True)})
# class SearchQuery(fields.Raw):
#     def format(self, value):
#         return {"q": value.q,
#                 "sorting": value.sorting,
#                 "from": getattr(value, "from"),
#                 "to": value.to,
#                 "vis_type": value.vis_type,
#                 "raw": value.raw}


@triple_ns.route('/search')
class Search(Resource):
    @triple_ns.doc(responses={200: 'OK',
                              400: 'Invalid search parameters'})
    @triple_ns.expect(search_query)
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

        headers = {}
        if data.get("result_type") == "json":
            headers["Content-Type"] = "application/json"
        if data.get("result_type") == "csv":
            result = pd.read_json(result).to_csv()
            headers["Content-Type"] = "text/csv"
            headers["Content-disposition"] = "attachment; filename={0}.csv".format(k)
        if data.get("result_type") == "raw":
            headers["Content-Type"] = "application/json"
        return make_response(result,
                             200,
                             headers)


@triple_ns.route('/example_data')
class ExampleData(Resource):
    @triple_ns.doc(description="Returns example map data for the following parameters:\n"
                               "q=feminicide, sorting=most-relevant, from=2019-01-01, "
                               "to=2019-12-31, result_type=csv",
                   responses={200: 'OK'})
    def get(self):
        k = str(uuid.uuid4())
        data = {"q": "feminicide",
                "sorting": "most-relevant",
                "from": "2019-01-01",
                "to": "2019-12-31",
                "vis_type": "overview",
                "result_type": "csv"}
        d = {"id": k, "params": data,
             "endpoint": "search"}
        redis_store.rpush("triple", json.dumps(d))
        result = get_key(redis_store, k)

        headers = {}
        if data.get("result_type") == "json":
            headers["Content-Type"] = "application/json"
        if data.get("result_type") == "csv":
            result = pd.read_json(result).to_csv()
            headers["Content-Type"] = "text/csv"
            headers["Content-disposition"] = "attachment; filename={0}.csv".format(k)
        if data.get("result_type") == "raw":
            headers["Content-Type"] = "application/json"
        return make_response(result,
                             200,
                             headers)


@triple_ns.route('/mappings')
class Mappings(Resource):
    @triple_ns.doc(responses={200: 'OK',
                              400: 'Invalid search parameters'},
                   params={"index": "Specify the ElasticSearch index to get the mapping of, currently either 'isidore-sources-triple' or 'isidore-documents-triple'"})
    # @triple_ns.marshal_with(mappings)
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
