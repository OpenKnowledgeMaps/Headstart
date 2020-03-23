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


with open("redis_config.json") as infile:
    redis_config = json.load(infile)

redis_store = redis.StrictRedis(**redis_config)

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


search_query = triple_ns.model("SearchQuery",
                               {"q": fields.String(example='feminicide',
                                                   description='query string',
                                                   required=True),
                                "sorting": fields.String(example='most-recent',
                                                         description='most-relevant or most-recent',
                                                         required=True),
                                "from": fields.String(example='2019-01-01',
                                                      description='yyyy-MM-dd',
                                                      required=True),
                                "to": fields.String(example='2019-12-31',
                                                    description='yyyy-MM-dd',
                                                    required=True),
                                "vis_type": fields.String(example='overview',
                                                          description='overview or timeline',
                                                          required=True),
                                "limit": fields.Integer(example=100,
                                                        description='max. number of results'),
                                "raw": fields.Boolean(example="false",
                                                      description='raw results from ElasticSearch')})


@triple_ns.route('/search')
class Search(Resource):
    @triple_ns.doc(responses={200: 'OK',
                              400: 'Invalid search parameters'})
    @triple_ns.expect(search_query)
    @triple_ns.produces(["application/json", "text/csv"])
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
        if request.headers["Accept"] == "application/json":
            headers["Content-Type"] = "application/json"
        if request.headers["Accept"] == "text/csv":
            if data.get("raw") is True:
                df = pd.DataFrame(result.get('input_data').get('hits').get('hits'))
                df = pd.concat([df.drop(["_source"], axis=1),
                                df["_source"].apply(pd.Series)],
                               axis=1)
                result = df.to_csv()
            else:
                result = pd.read_json(result).to_csv()
            headers["Content-Type"] = "text/csv"
            headers["Content-Disposition"] = "attachment; filename={0}.csv".format(k)
        if data.get("raw") is True:
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
