from hashlib import md5
from datetime import datetime
import json
from collections import OrderedDict
from flask import Blueprint, request, make_response, jsonify, abort
from flask_restx import Namespace, Resource, fields

from models import Revisions, Visualizations
from database import db


persistence_ns = Namespace("persistence", description="OKMAps persistence operations")


def create_vis_id(params, param_types):
    # create map id
    ordered_params = OrderedDict()
    for k in param_types:
        ordered_params[k] = params[k]
    string_to_hash = json.dumps(ordered_params, separators=(',', ':'))
    string_to_hash = " ".join([params["q"], string_to_hash])
    mapid = md5(string_to_hash.encode('utf-8')).hexdigest()
    return mapid


def write_revision(vis_id, data, rev_id=None):

    vis = db.session.query(Visualizations).filter_by(vis_id=vis_id).first()

    if rev_id is None:
        if vis.vis_latest is None:
            rev_id = 1
        else:
            rev_id = vis.vis_latest + 1

    query = vis.vis_clean_query

    new_rev = Revisions(
                rev_id=rev_id,
                rev_vis=vis_id,
                rev_user="System",
                rev_timestamp=datetime.utcnow(),
                rev_comment="Visualization created",
                rev_data=data,
                vis_query=query)
    db.session.add(new_rev)
    vis.vis_latest = rev_id
    db.session.commit()


def create_visualization(vis_id, vis_title, data,
                         vis_clean_query=None, vis_query=None,
                         vis_params=None):
    if not exists_visualization(vis_id):
        new_vis = Visualizations(
                    vis_id=vis_id,
                    vis_clean_query=vis_clean_query,
                    vis_query=vis_query,
                    vis_title=vis_title,
                    vis_params=vis_params)
        db.session.add(new_vis)
        db.session.commit()
        write_revision(vis_id, data, 1)


def exists_visualization(vis_id):
    vis = db.session.query(Visualizations).filter_by(vis_id=vis_id).first()
    exists = True if vis else False
    return exists


def get_last_version(vis_id, details=False, context=False):
    return get_revision(vis_id, None, details, context)


def get_revision(vis_id, rev_id, details=False, context=False):
    if rev_id is None:
        vis, rev = (db.session
                      .query(Visualizations, Revisions)
                      .select_from(Visualizations, Revisions)
                      .filter(Visualizations.vis_id == vis_id)
                      .filter(Revisions.rev_vis == vis_id)
                      .filter(Revisions.rev_id == Visualizations.vis_latest)
                    ).first()
    else:
        vis, rev = (db.session
                      .query(Visualizations, Revisions)
                      .select_from(Visualizations, Revisions)
                      .filter(Visualizations.vis_id == vis_id)
                      .filter(Revisions.rev_vis == vis_id)
                      .filter(Revisions.rev_id == rev_id)
                    ).first()
    if context is True:
        res = {
            "rev_vis": rev.rev_vis,
            "vis_query": rev.vis_query,
            "vis_title": vis.vis_title,
            "rev_timestamp": rev.rev_timestamp,
            "vis_params": vis.vis_params,
            "rev_data": rev.rev_data
        }
        return res
    else:
        if details is True:
            return rev.as_dict()
        else:
            return rev.rev_data


@persistence_ns.route('/existsVisualization')
class existsVisualization(Resource):

    def post(self):
        payload = request.get_json()
        vis_id = payload.get("vis_id")
        exists = exists_visualization(vis_id)
        # create response
        headers = {}
        result = {"exists": exists}
        headers["Content-Type"] = "application/json"
        return make_response(result, 200, headers)


@persistence_ns.route('/createVisualization')
class createVisualization(Resource):

    def post(self):
        try:
            payload = request.get_json()
            persistence_ns.logger.debug(payload.keys())
            vis_id = payload.get('vis_id')
            vis_title = payload.get('vis_title')
            data = payload.get('data')
            vis_clean_query = payload.get('vis_clean_query')
            vis_query = payload.get('vis_query')
            vis_params = payload.get('vis_params')
            persistence_ns.logger.debug(vis_id)
            persistence_ns.logger.debug(vis_title)
            persistence_ns.logger.debug(vis_clean_query)
            persistence_ns.logger.debug(vis_query)
            persistence_ns.logger.debug(vis_params)
            create_visualization(vis_id, vis_title, data,
                                 vis_clean_query, vis_query, vis_params)
            result = {'success': True}
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result),
                                 200,
                                 headers)
        except Exception as e:
            result = {'success': False, 'reason': e}
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result),
                                 500,
                                 headers)


@persistence_ns.route('/getLastVersion')
class getLastVersion(Resource):
    """
    Is actually a call to getRevision but taking the latest one

    params: vis_id, details(false), context(false)

    """

    def post(self):
        try:
            payload = request.get_json()
            persistence_ns.logger.debug(payload)
            vis_id = payload.get('vis_id')
            details = payload.get('details')
            context = payload.get('context')
            result = get_last_version(vis_id, details, context)
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result),
                                 200,
                                 headers)
        except Exception as e:
            result = {'success': False, 'reason': str(e)}
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result),
                                 500,
                                 headers)


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

    @persistence_ns.produces(["application/json"])
    def post(self):
        try:
            payload = request.get_json()
            vis_id = payload.get("vis_id")
            data = payload.get("data")
            persistence_ns.logger.debug(data)
            write_revision(vis_id, data, None)
            result = {'success': True}
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result), 200, headers)
        except Exception as e:
            result = {'success': False, 'reason': e}
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result), 500, headers)


@persistence_ns.route('/createID')
class createID(Resource):

    @persistence_ns.produces(["application/json"])
    def post(self):
        try:
            payload = request.get_json()
            params = payload.get("params")
            param_types = payload.get("param_types")
            mapid = create_vis_id(params, param_types)
            # create response
            headers = {}
            result = {"unique_id": mapid}
            headers["Content-Type"] = "application/json"
            return make_response(jsonify(result), 200, headers)
        except Exception as e:
            result = {'success': False, 'reason': e}
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result), 500, headers)
