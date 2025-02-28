import os
import json
import uuid
import pandas as pd

from flask import Blueprint, request, make_response, jsonify, abort
from flask_restx import Namespace, Resource, fields
from .request_validators import SearchParamSchema
from apis.utils import get_key, redis_store



pubmed_ns = Namespace("pubmed", description="PubMed API operations")
search_param_schema = SearchParamSchema()


pubmed_querymodel = pubmed_ns.model("SearchQuery",
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


@pubmed_ns.route('/search')
class Search(Resource):
    @pubmed_ns.doc(responses={200: 'OK',
                              400: 'Invalid search parameters'})
    @pubmed_ns.expect(pubmed_querymodel)
    @pubmed_ns.produces(["application/json", "text/csv"])
    def post(self):
        """
        """
        params = request.get_json()
        pubmed_ns.logger.debug(params)
        if "optradio" in params:
            del params["optradio"]
        errors = search_param_schema.validate(params, partial=True)
        params = sanitize_params(params)
        params["limit"] = 100
        params["list_size"] = 100
        pubmed_ns.logger.debug(errors)
        if errors:
            abort(400, str(errors))
        k = str(uuid.uuid4())
        d = {"id": k, "params": params,
             "endpoint": "search"}
        pubmed_ns.logger.debug(d)
        redis_store.rpush("pubmed", json.dumps(d))
        q_len = redis_store.llen("pubmed")
        pubmed_ns.logger.debug("Queue length: %s %d %s" %("pubmed", q_len, k))
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
            pubmed_ns.logger.error(e)
            abort(500, "Problem encountered, check logs.")

@pubmed_ns.route('/service_version')
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
            