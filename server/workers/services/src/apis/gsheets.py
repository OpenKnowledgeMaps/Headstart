import os
import json
import uuid
import redis
from datetime import datetime

from flask import request, make_response, jsonify, abort, render_template
from flask_restx import Namespace, Resource, fields
from apis.utils import get_key


with open("redis_config.json") as infile:
    redis_config = json.load(infile)

redis_store = redis.StrictRedis(**redis_config)

gsheets_ns = Namespace("google_sheets", description="Google Sheets API operations")


search_query = gsheets_ns.model("SearchQuery",
                                {"sheet_id": fields.String(example='1csx2x9DxoEd8Bi67mGxKkAVMB8d_A',
                                                           description='sheet ID to update',
                                                           required=True),
                                 "sheet_range": fields.String(example="Resources!A1:N200",
                                                              description="Sheet name and data range to retrieve from",
                                                              required=True),
                                 "q": fields.String(example='covid19',
                                                            description='hardcoded vis name'),
                                 "last_update": fields.String(example='2020-07-20 11:47:50 UTC',
                                                              description='timestamp of last known GSheets edit')})


@gsheets_ns.route('/search')
class Search(Resource):
    @gsheets_ns.doc(responses={200: 'OK',
                               400: 'Invalid search parameters'})
    @gsheets_ns.expect(search_query)
    @gsheets_ns.produces(["application/json"])
    def post(self):
        """
        """
        params = request.get_json()
        # fill default params
        params["vis_type"] = "overview"
        params["service"] = "gsheets"
        gsheets_ns.logger.debug(params)
        k = str(uuid.uuid4())
        d = {"id": k, "params": params,
             "endpoint": "search"}
        gsheets_ns.logger.debug(d)
        redis_store.rpush("gsheets", json.dumps(d))
        result = get_key(redis_store, k)
        try:
            headers = {}
            headers["Content-Type"] = "application/json"
            return make_response(result,
                                 200,
                                 headers)
        except Exception as e:
            gsheets_ns.logger.error(e)
            abort(500, "Problem encountered during processing, sorry.")
