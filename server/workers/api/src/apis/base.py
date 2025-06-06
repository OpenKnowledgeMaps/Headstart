import os
import json
import uuid
import pandas as pd
import time

from flask import request, make_response, jsonify, abort, g
from flask_restx import Namespace, Resource, fields
from .request_validators import SearchParamSchema
from common.utils import get_key, redis_store, get_or_create_contentprovider_lookup

contentprovider_lookup = get_or_create_contentprovider_lookup()

base_ns = Namespace("base", description="BASE API operations")
search_param_schema = SearchParamSchema()


base_querymodel = base_ns.model("SearchQuery",
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
                                "list_size": fields.Integer(),
                                "language": fields.String(example='en',
                                                          description='language code, optional',
                                                          required=False),
                                "raw": fields.Boolean(example="false",
                                                      description='raw results from ElasticSearch')})

# Utility function to set response headers
def set_response_headers(accept_header, is_raw, result, filename):
    headers = {}
    if accept_header == "application/json":
        headers["Content-Type"] = "application/json"
    elif accept_header == "text/csv":
        result = pd.read_json(json.loads(result)).to_csv() if is_raw else pd.read_json(json.loads(result)).to_csv()
        headers["Content-Type"] = "text/csv"
        headers["Content-Disposition"] = f"attachment; filename={filename}.csv"
    return result, headers

@base_ns.route('/search')
class Search(Resource):
    @base_ns.doc(responses={200: 'OK',
                              400: 'Invalid search parameters'})
    @base_ns.expect(base_querymodel)
    @base_ns.produces(["application/json", "text/csv"])
    def post(self):
        """
        """
        params = request.get_json()
        base_ns.logger.debug(params)
        if "optradio" in params:
            del params["optradio"]
        errors = search_param_schema.validate(params, partial=True)
        if "limit" not in params:
            params["limit"] = 120
        if params.get('vis_type') == "timeline":
            params["limit"] = 1000
            params["list_size"] = params["limit"]
        if "list_size" not in params:
            params["list_size"] = 100
        if "repo" in params:
            repo_name = contentprovider_lookup.get(params["repo"])
            params["repo_name"] = repo_name
        base_ns.logger.debug(errors)
        if errors:
            abort(400, str(errors))
        request_id = str(uuid.uuid4())
        d = {"id": request_id, "params": params,
             "endpoint": "search"}
        base_ns.logger.debug(d)
        redis_store.rpush("base", json.dumps(d))
        q_len = redis_store.llen("base")
        base_ns.logger.debug("Queue length: %s %d %s" %("base", q_len, request_id))
        result = get_key(redis_store, request_id, 300)
        try:
            result, headers = set_response_headers(request.headers["Accept"], params.get("raw"), result, request_id)
            return make_response(result, 200, headers)
        except Exception as e:
            base_ns.logger.error(e)
            abort(500, "Problem encountered, check logs.")

@base_ns.route('/contentproviders')
class ContentProvider(Resource):
    @base_ns.doc(responses={200: 'OK',
                              400: 'Invalid search parameters'})
    @base_ns.produces(["application/json"])
    def post(self):
        """
        params: can be empty, or {"repo": "ft..."}, BASE internal name, e.g. "ftunivlausanne"

        returns: json
        {"repo_name": "Université de Lausanne (UNIL): Serval - Serveur académique lausannois"}
        """
        params = request.get_json()
        base_ns.logger.debug(params)
        if not params:
            result = contentprovider_lookup
        else:
            result = {"repo_name": contentprovider_lookup.get(params["repo"])}
        try:
            headers = {}
            headers["Content-Type"] = "application/json"
            return make_response(result,
                                 200,
                                 headers)
        except Exception as e:
            base_ns.logger.error(e)
            abort(500, "Problem encountered, check logs.")
        

class ServiceVersion(Resource):
    def get(self):
        result = {"service_version": os.getenv("SERVICE_VERSION")}
        return make_response(result, 200, {"Content-Type": "application/json"})
