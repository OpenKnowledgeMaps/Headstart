import os

from flask import request, make_response, abort
from flask_restx import Namespace, Resource, fields
from common.aquanavi.mapping import map_sample_data

# Namespace setup
aquanavi_ns = Namespace("aquanavi", description="AQUANAVI API operations")

# Model definition
aquanavi_querymodel = aquanavi_ns.model("SearchQuery", {
        "q": fields.String(
            example='aquatic mesocosm facilities',
            description='query string',
            required=True
        ),
    }
)

@aquanavi_ns.route("/search")
class Search(Resource):
    @aquanavi_ns.doc(responses={ 200: "OK", 400: "Invalid search parameters" })
    @aquanavi_ns.expect(aquanavi_querymodel)
    @aquanavi_ns.produces(["application/json", "text/csv"])
    def post(self):
        """
        Perform a search query using AQUANAVI API.
        """
        try:
            sample_data = map_sample_data()
            headers = self.get_response_headers()
            return make_response(sample_data, 200, headers)
        except Exception as e:
            aquanavi_ns.logger.error(e)
            abort(500, "Problem encountered, check logs.")

    def get_response_headers(self):
        headers = {}
        if request.headers["Accept"] == "application/json":
            headers["Content-Type"] = "application/json"
        return headers


@aquanavi_ns.route("/service_version")
class ServiceVersion(Resource):
    def get(self):
        """
        Get the current service version.
        """
        result = {"service_version": os.getenv("SERVICE_VERSION")}
        return make_response(result, 200, { "Content-Type": "application/json" })