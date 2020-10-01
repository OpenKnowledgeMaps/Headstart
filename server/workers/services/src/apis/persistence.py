from hashlib import md5
from datetime import datetime
import json
from collections import OrderedDict
from flask import Blueprint, request, make_response, jsonify, abort
from flask_restx import Namespace, Resource, fields

from models import Revisions, Visualizations


persistence_ns = Namespace("persistence", description="OKMAps persistence operations")


def write_revision(vis_id, data, rev_id=None):

    vis = Visualizations.query.filter_by(vis_id=vis_id).first()

    rev = rev_id
    if rev is None:
        r_id = vis.vis_latest
        rev = r_id + 1

    query = vis.vis_clean_query

    new_rev = {
                "rev_id": rev,
                "rev_vis": vis_id,
                "rev_user": "System",
                "rev_timestamp": datetime.utcnow(),
                "rev_comment": "Visualization created",
                "rev_data": data,
                "vis_query": query
    }
    Revisions.create(**new_rev)


def create_visualization(vis_id, vis_title, data,
                         vis_clean_query=None, vis_query=None,
                         params=None):
    pass


def exists_visualization(vis_id):
    map = Visualizations.query.filter_by(vis_id=vis_id).first()
    exists = True if map else False
    return exists


@persistence_ns.route('/createVisualization')
class createVisualization(Resource):

    def post(self):
        payload = request.get_json()
        vis_id = payload.get('vis_id')
        data = payload.get('data')
        rev_id = payload.get('rev_id')



@persistence_ns.route('/getLastVersion')
class getLastVersion(Resource):
    pass


@persistence_ns.route('/getRevision')
class getRevision(Resource):

    @persistence_ns.produces(["application/json"])
    def post(self):

        # create response
        headers = {}
        result = {}
        headers["Content-Type"] = "application/json"
        return make_response(result, 200, headers)


@persistence_ns.route('/writeRevision')
class writeRevision(Resource):
    # (vis_id, data)
    pass


@persistence_ns.route('/createID')
class createID(Resource):

    @persistence_ns.produces(["application/json"])
    def post(self):
        payload = request.get_json()
        params = payload.get("params")
        param_types = payload.get("param_types")
        # create map id
        ordered_params = OrderedDict()
        for k in param_types:
            ordered_params[k] = params[k]
        string_to_hash = json.dumps(ordered_params, separators=(',', ':'))
        string_to_hash = " ".join([params["q"], string_to_hash])
        mapid = md5(string_to_hash.encode('utf-8')).hexdigest()
        # create response
        headers = {}
        result = {"unique_id": mapid}
        headers["Content-Type"] = "application/json"
        return make_response(result, 200, headers)
