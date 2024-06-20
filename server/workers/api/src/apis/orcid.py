import os
import json
import uuid
import pandas as pd
import time

from flask import request, make_response, jsonify, abort, g
from flask_restx import Namespace, Resource, fields
from .request_validators import SearchParamSchema
from apis.utils import get_key, redis_store

orcid_ns = Namespace("orcid", description="ORCiD API operations")
search_param_schema = SearchParamSchema()


orcid_querymodel = orcid_ns.model("SearchQuery",
                               {"q": fields.String(example='',
                                                   description='query string',
                                                   required=True),
                                "orcid": fields.String(example='1234-5678-9012-3456',
                                                         description='ORCiD iD',
                                                         required=True)})



@orcid_ns.route('/search')
class Search(Resource):
    @orcid_ns.doc(responses={200: 'OK',
                              400: 'Invalid search parameters'})
    @orcid_ns.expect(orcid_querymodel)
    @orcid_ns.produces(["application/json", "text/csv"])
    def post(self):
        """
        """
        params = request.get_json()
        orcid_ns.logger.debug(params)
        if "optradio" in params:
            del params["optradio"]
        errors = search_param_schema.validate(params, partial=True)
        orcid_ns.logger.debug(errors)
        if errors:
            abort(400, str(errors))
        k = str(uuid.uuid4())
        d = {"id": k, "params": params,
             "endpoint": "search"}
        orcid_ns.logger.debug(d)
        redis_store.rpush("orcid", json.dumps(d))
        q_len = redis_store.llen("orcid")
        orcid_ns.logger.debug("Queue length: %s %d %s" %("orcid", q_len, k))
        result = get_key(redis_store, k, 300)
        try:
            headers = {}
            if request.headers["Accept"] == "application/json":
                headers["Content-Type"] = "application/json"
            return make_response(result,
                                 200,
                                 headers)
        except Exception as e:
            orcid_ns.logger.error(e)
            abort(500, "Problem encountered, check logs.")

@orcid_ns.route('/service_version')
class ServiceVersion(Resource):
    def get(self):
        result = {"service_version": os.getenv("SERVICE_VERSION")}
        return make_response(result, 200, {"Content-Type": "application/json"})
