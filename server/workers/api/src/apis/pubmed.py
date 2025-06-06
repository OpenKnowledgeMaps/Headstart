import os
import json
import uuid
import pandas as pd

from flask import Blueprint, request, make_response, jsonify, abort
from flask_restx import Namespace, Resource, fields
from .request_validators import SearchParamSchema
from common.utils import get_key, redis_store


pubmed_ns = Namespace("pubmed", description="PubMed API operations")
search_param_schema = SearchParamSchema()

pubmed_querymodel = pubmed_ns.model(
    "SearchQuery",
    {
        "q": fields.String(
            example="feminicide", description="query string", required=True
        ),
        "sorting": fields.String(
            example="most-recent",
            description="most-relevant or most-recent",
            required=True,
        ),
        "from": fields.String(
            example="2019-01-01", description="yyyy-MM-dd", required=True
        ),
        "to": fields.String(
            example="2019-12-31", description="yyyy-MM-dd", required=True
        ),
        "vis_type": fields.String(
            example="overview", description="overview or timeline", required=True
        ),
        "limit": fields.Integer(example=100, description="max. number of results"),
        "language": fields.String(
            example="en", description="language code, optional", required=False
        ),
        "raw": fields.Boolean(
            example="false", description="raw results from ElasticSearch"
        ),
    },
)

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

@pubmed_ns.route("/search")
class Search(Resource):
    @pubmed_ns.doc(responses={200: "OK", 400: "Invalid search parameters"})
    @pubmed_ns.expect(pubmed_querymodel)
    @pubmed_ns.produces(["application/json", "text/csv"])
    def post(self):
        """ """
        params: dict[str, str] = request.get_json()
        pubmed_ns.logger.debug(params)

        # Clean and validate params
        params.pop("optradio", None)
        params = sanitize_params(params)
        params["limit"] = 100
        params["list_size"] = 100
        errors = search_param_schema.validate(params, partial=True)
        if errors:
            pubmed_ns.logger.debug(errors)
            abort(400, str(errors))

        # Log and queue the request
        request_id = str(uuid.uuid4())
        request_data = {"id": request_id, "params": params, "endpoint": "search"}
        pubmed_ns.logger.debug(request_data)
        redis_store.rpush("pubmed", json.dumps(request_data))
        queue_length = redis_store.llen("pubmed")
        pubmed_ns.logger.debug("Queue length: %s %d %s" % ("pubmed", queue_length, request_id))
        
        # Get the result
        result = get_key(redis_store, request_id)
        try:
            result, headers = set_response_headers(request.headers.get("Accept"), params.get("raw"), result, request_id)
            return make_response(result, 200, headers)
        except Exception as e:
            pubmed_ns.logger.error(e)
            abort(500, "Problem encountered, check logs.")


@pubmed_ns.route("/service_version")
class ServiceVersion(Resource):
    def get(self):
        result = {"service_version": os.getenv("SERVICE_VERSION")}
        return make_response(result, 200, {"Content-Type": "application/json"})
    
def sanitize_params(params):
    article_types = params.get("article_types")
    if article_types:
        article_types = [at.replace("&#39;", "'") for at in article_types]
        params["article_types"] = article_types
    return params
            