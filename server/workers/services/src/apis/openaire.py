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
from apis.utils import get_key


with open("redis_config.json") as infile:
    redis_config = json.load(infile)

redis_store = redis.StrictRedis(**redis_config)

openaire_ns = Namespace("openaire", description="OpenAIRE API operations")


search_param_schema = SearchParamSchema()


search_query = openaire_ns.model("SearchQuery",
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
                                "language": fields.String(example='en',
                                                          description='language code, optional',
                                                          required=False),
                                "raw": fields.Boolean(example="false",
                                                      description='raw results from ElasticSearch')})


@openaire_ns.route('/search')
class Search(Resource):
    @openaire_ns.doc(responses={200: 'OK',
                              400: 'Invalid search parameters'})
    @openaire_ns.expect(search_query)
    @openaire_ns.produces(["application/json", "text/csv"])
    def post(self):
        """
        """
        params = request.get_json()
        openaire_ns.logger.debug(params)
        #errors = search_param_schema.validate(params, partial=True)
        params["limit"] = 100
        params["list_size"] = -1
        # openaire_ns.logger.debug(errors)
        # if errors:
        #     abort(400, str(errors))
        k = str(uuid.uuid4())
        d = {"id": k, "params": params,
             "endpoint": "search"}
        openaire_ns.logger.debug(d)
        redis_store.rpush("openaire", json.dumps(d))
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
            if params.get("raw") is True:
                headers["Content-Type"] = "application/json"
            return make_response(result,
                                 200,
                                 headers)
        except Exception as e:
            openaire_ns.logger.error(e)
            abort(500, "Problem encountered, check logs.")
