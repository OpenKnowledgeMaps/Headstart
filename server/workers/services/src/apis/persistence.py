from datetime import datetime
from models import Revisions, Visualizations

from flask import Blueprint, request, make_response, jsonify, abort
from flask_restx import Namespace, Resource, fields

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
    # (vis_id, vis_title, data)
    pass


@persistence_ns.route('/getRevision')
class getRevision(Resource):
    # (vis_id, rev_id)
    pass


@persistence_ns.route('/writeRevision')
class writeRevision(Resource):
    # (vis_id, data)
    pass
