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
from apis.utils import get_key, detect_error


redis_config = {
    "host": os.getenv("REDIS_HOST"),
    "port": os.getenv("REDIS_PORT"),
    "db": os.getenv("REDIS_DB"),
    "password": os.getenv("REDIS_PASSWORD")
}
redis_store = redis.StrictRedis(**redis_config)

triple_ns = Namespace("triple", description="TRIPLE API operations")


search_param_schema = SearchParamSchema()


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
                                "language": fields.String(example='en',
                                                          description='language code, optional',
                                                          required=False),
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
        if redis_store.llen("input_data") > 10:
            result = {"status": "error",
                      "reason": "dataprocessing rate limit"}
            return jsonify(result)
        params = request.get_json()
        triple_ns.logger.debug(params)
        errors = search_param_schema.validate(params, partial=True)
        params["list_size"] = params.get('limit', 100)
        triple_ns.logger.debug(errors)
        if errors:
            abort(400, str(errors))
        k = str(uuid.uuid4())
        d = {"id": k, "params": params,
             "endpoint": "search"}
        triple_ns.logger.debug(d)
        # if length of queue > ??
        # make_response with "wait later" and 503+headers
        # have this handled by lightweight-client in search.php
        # which then is handled by search-flow under new processing-timeout error 
        # add to logging
        redis_store.rpush("triple", json.dumps(d))
        result = get_key(redis_store, k)
        headers = {}
        if not isinstance(result, str) and result.get('status') != "success":
            code, reason = detect_error("triple", result.get('error'), params)
            result = {"status": "error",
                      "reason": reason}
            headers["Content-Type"] = "application/json"
            return jsonify(result)
        try:
            if request.headers["Accept"] == "application/json":
                headers["Content-Type"] = "application/json"
            if request.headers["Accept"] == "text/csv":
                if params.get("raw") is True:
                    df = pd.DataFrame(result.get('input_data').get('hits').get('hits'))
                    df = pd.concat([df.drop(["_source"], axis=1),
                                    df["_source"].apply(pd.Series)],
                                   axis=1)
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
            triple_ns.logger.error(e)
            result = {"status": "error",
                      "reason": ['unexpected data processing error']}
            headers["Content-Type"] = "application/json"
            return jsonify(result)


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


@triple_ns.route('/service_version')
class ServiceVersion(Resource):
    def get(self):
        result = {"service_version": os.getenv("SERVICE_VERSION")}
        return make_response(result, 200, {"Content-Type": "application/json"})

@triple_ns.route('/healthcheck')
class Healthcheck(Resource):
    def get(self):
        result = {"status": "I'm good"}
        return make_response(result, 200, {"Content-Type": "application/json"})