import os
from hashlib import md5
from datetime import datetime
import json
from collections import OrderedDict
from flask import Blueprint, request, make_response, jsonify, abort
from flask_restx import Namespace, Resource, fields

from models import Revisions, Visualizations
from database import sessions
import settings


persistence_ns = Namespace("persistence", description="OKMAps persistence operations")


def select_session(Session=None):
    """Select session according to database,
        else select session for default database."""
    if Session is not None:
        return Session()
    else:
        return sessions.get(settings.DEFAULT["db"])()


def create_vis_id(params, param_types):
    # create map id
    ordered_params = OrderedDict()
    for k in param_types:
        v = params[k]
        v = [str(e) for e in v] if isinstance(v, list) else str(v)
        ordered_params[k] = v
    string_to_hash = json.dumps(ordered_params, separators=(',', ':'))
    string_to_hash = " ".join([params["q"].replace('"', '\\"'), string_to_hash])
    vis_id = md5(string_to_hash.encode('utf-8')).hexdigest()
    return vis_id


def write_revision(database, vis_id, data, rev_id=None):
    session = select_session(sessions.get(database))
    vis = session.query(Visualizations).filter_by(vis_id=vis_id).first()

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
    session.add(new_rev)
    vis.vis_latest = rev_id
    session.commit()
    session.close()


def create_visualization(database,
                         vis_id, vis_title, data,
                         vis_clean_query=None, vis_query=None,
                         vis_params=None):
    if not exists_visualization(database, vis_id):
        session = select_session(sessions.get(database))
        new_vis = Visualizations(
                    vis_id=vis_id,
                    vis_clean_query=vis_clean_query,
                    vis_query=vis_query,
                    vis_title=vis_title,
                    vis_params=vis_params)
        session.add(new_vis)
        session.commit()
        write_revision(database, vis_id, data, 1)
        session.close()


def exists_visualization(database, vis_id):
    session = select_session(sessions.get(database))
    vis = session.query(Visualizations).filter_by(vis_id=vis_id).first()
    exists = True if vis else False
    session.close()
    return exists


def get_last_version(database, vis_id, details=False, context=False):
    return get_revision(database, vis_id, None, details, context)


def get_revision(database, vis_id, rev_id, details=False, context=False):
    try:
        session = select_session(sessions.get(database))
        if rev_id is None:
            vis, rev = (session
                        .query(Visualizations, Revisions)
                        .select_from(Visualizations, Revisions)
                        .filter(Visualizations.vis_id == vis_id)
                        .filter(Revisions.rev_vis == vis_id)
                        .filter(Revisions.rev_id == Visualizations.vis_latest)
                        ).first()
        else:
            vis, rev = (session
                        .query(Visualizations, Revisions)
                        .select_from(Visualizations, Revisions)
                        .filter(Visualizations.vis_id == vis_id)
                        .filter(Revisions.rev_vis == vis_id)
                        .filter(Revisions.rev_id == rev_id)
                        ).first()
        session.close()
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
    except TypeError:
        persistence_ns.logger.info("Vis ID not found: %s in database %s" % (vis_id, database))
        return None


def get_context(database, vis_id, revision_context=False):
    session = select_session(sessions.get(database))
    vis, rev = (session
                .query(Visualizations, Revisions)
                .select_from(Visualizations, Revisions)
                .filter(Visualizations.vis_id == vis_id)
                .filter(Revisions.rev_vis == vis_id)
                .filter(Revisions.rev_id == Visualizations.vis_latest)
                ).first()
    res = {
        "rev_vis": rev.rev_vis,
        "vis_query": rev.vis_query,
        "vis_title": vis.vis_title,
        "rev_timestamp": rev.rev_timestamp,
        "vis_params": vis.vis_params
    }
    if revision_context == 'true':
        data = json.loads(rev.rev_data)
        res["additional_context"] = data.get("additional_context", {})
    session.close()
    return res


@persistence_ns.route('/existsVisualization/<database>')
class existsVisualization(Resource):

    def post(self, database):
        payload = request.get_json()
        vis_id = payload.get("vis_id")
        persistence_ns.logger.debug("existsVisualization: %s" % vis_id)
        exists = exists_visualization(database, vis_id)
        # create response
        headers = {}
        result = {"exists": exists}
        headers["Content-Type"] = "application/json"
        return make_response(result, 200, headers)


@persistence_ns.route('/createVisualization/<database>')
class createVisualization(Resource):

    def post(self, database):
        try:
            payload = request.get_json()
            persistence_ns.logger.debug("createVisualization")
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
            create_visualization(database,
                                 vis_id, vis_title, data,
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


@persistence_ns.route('/writeRevision/<database>')
class writeRevision(Resource):

    @persistence_ns.produces(["application/json"])
    def post(self, database):
        try:
            payload = request.get_json()
            persistence_ns.logger.debug("writeRevision")
            vis_id = payload.get("vis_id")
            data = payload.get("data")
            # persistence_ns.logger.debug(data)
            write_revision(database, vis_id, data)
            result = {'success': True}
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result), 200, headers)
        except Exception as e:
            result = {'success': False, 'reason': e}
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result), 500, headers)


@persistence_ns.route('/getLastVersion/<database>')
class getLastVersion(Resource):
    """
    Is actually a call to getRevision but taking the latest one

    params: vis_id, details(false), context(false)

    """

    def post(self, database):
        try:
            payload = request.get_json()
            persistence_ns.logger.debug("getLastVersion")
            persistence_ns.logger.debug(payload)
            vis_id = payload.get('vis_id')
            details = payload.get('details')
            context = payload.get('context')
            result = get_last_version(database, vis_id, details, context)
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


@persistence_ns.route('/getRevision/<database>')
class getRevision(Resource):

    @persistence_ns.produces(["application/json"])
    def post(self, database):

        # create response
        headers = {}
        result = {}
        headers["Content-Type"] = "application/json"
        return make_response(result, 200, headers)


@persistence_ns.route('/getContext/<database>')
class getContext(Resource):

    @persistence_ns.produces(["application/json"])
    def post(self, database):
        try:
            payload = request.get_json()
            persistence_ns.logger.debug("getContext")
            persistence_ns.logger.debug(payload)
            vis_id = payload.get('vis_id')
            revision_context = payload.get('revision_context', False)
            result = get_context(database, vis_id, revision_context)
            persistence_ns.logger.debug(result)
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


@persistence_ns.route('/createID/<database>')
class createID(Resource):

    @persistence_ns.produces(["application/json"])
    def post(self, database):
        try:
            persistence_ns.logger.debug("createID")
            payload = request.get_json()
            params = payload.get("params")
            param_types = payload.get("param_types")
            vis_id = create_vis_id(params, param_types)
            persistence_ns.logger.debug(params)
            persistence_ns.logger.debug(param_types)
            persistence_ns.logger.debug(vis_id)
            # create response
            headers = {}
            result = {"unique_id": vis_id}
            headers["Content-Type"] = "application/json"
            return make_response(jsonify(result), 200, headers)
        except Exception as e:
            result = {'success': False, 'reason': e}
            headers = {'ContentType': 'application/json'}
            return make_response(jsonify(result), 500, headers)

            
@persistence_ns.route('/service_version')
class ServiceVersion(Resource):
    def get(self):
        result = {"service_version": os.getenv("SERVICE_VERSION")}
        return make_response(result, 200, {"Content-Type": "application/json"})