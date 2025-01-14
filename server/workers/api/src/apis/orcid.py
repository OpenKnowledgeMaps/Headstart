import os
import json
import uuid
import pandas as pd
import time

from flask import request, make_response, jsonify, abort, g
from flask_restx import Namespace, Resource, fields
from .request_validators import SearchParamSchema
from common.utils import get_key, redis_store


# Namespace setup
orcid_ns = Namespace("orcid", description="ORCiD API operations")

# Schema validator
search_param_schema = SearchParamSchema()

# Constants
DEFAULT_LIMIT = 200
REDIS_TIMEOUT = 600
DEFAULT_ACADEMIC_AGE_OFFSET = 0

# Model definition
orcid_querymodel = orcid_ns.model(
    "SearchQuery",
    {
        "q": fields.String(
            example='',
            description='query string',
            required=True
        ),
        "orcid": fields.String(
            example='1234-5678-9012-3456',
            description='ORCID iD',
            required=True
        )
    }
)


@orcid_ns.route("/search")
class Search(Resource):
    @orcid_ns.doc(responses={200: "OK", 400: "Invalid search parameters"})
    @orcid_ns.expect(orcid_querymodel)
    @orcid_ns.produces(["application/json", "text/csv"])
    def post(self):
        """
        Perform a search query using ORCID API.
        """
        try:
            params = request.get_json()
            orcid_ns.logger.debug(params)

            self.clean_params(params)

            request_id = str(uuid.uuid4())
            task_data = {"id": request_id, "params": params, "endpoint": "search"}
            orcid_ns.logger.debug(task_data)
            redis_store.rpush("orcid", json.dumps(task_data))

            queue_length = redis_store.llen("orcid")
            orcid_ns.logger.debug(f"Queue length: orcid {queue_length} {request_id}")

            result = get_key(redis_store, request_id, REDIS_TIMEOUT)
            headers = self.get_response_headers()

            return make_response(result, 200, headers)
        except Exception as e:
            orcid_ns.logger.error(e)
            abort(500, "Problem encountered, check logs.")

    def clean_params(self, params):
        if "optradio" in params:
            del params["optradio"]
        if "limit" not in params:
            params["limit"] = DEFAULT_LIMIT
        if "academic_age_offset" not in params:
            params["academic_age_offset"] = DEFAULT_ACADEMIC_AGE_OFFSET

    def get_response_headers(self):
        headers = {}
        if request.headers["Accept"] == "application/json":
            headers["Content-Type"] = "application/json"
        return headers


@orcid_ns.route("/service_version")
class ServiceVersion(Resource):
    def get(self):
        """
        Get the current service version.
        """
        result = {"service_version": os.getenv("SERVICE_VERSION")}
        return make_response(result, 200, {"Content-Type": "application/json"})