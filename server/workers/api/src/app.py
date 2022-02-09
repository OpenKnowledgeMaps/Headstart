import os
import sys
from flask import Flask, redirect, url_for
from flask_restx import Api
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

from apis.triple import triple_ns
from apis.gsheets import gsheets_ns
from apis.base import base_ns
from apis.pubmed import pubmed_ns
from apis.openaire import openaire_ns
from apis.create_vis import vis_ns

from utils.monkeypatches import ReverseProxied, __schema__, specs_url, _register_apidoc
import logging


def api_patches(app):
    Api._register_apidoc = _register_apidoc
    Api.__schema__ = __schema__
    Api.specs_url = specs_url

    api_fixed = Api(
        app,
        title="Head Start API",
        description="Head Start API demo",
        version="0.1",
        prefix='/api',
        doc="/docs")
    if os.getenv("BEHIND_PROXY") == "True":
        api_fixed.behind_proxy = True
    return api_fixed


app = Flask('v1', instance_relative_config=True)
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(app.logger.level)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_port=1, x_for=1, x_host=1, x_prefix=1)
app.wsgi_app = ReverseProxied(app.wsgi_app)
CORS(app, expose_headers=["Content-Disposition", "Access-Control-Allow-Origin"])

api = api_patches(app)
api.add_namespace(triple_ns, path='/triple')
api.add_namespace(gsheets_ns, path='/gsheets')
api.add_namespace(base_ns, path='/base')
api.add_namespace(pubmed_ns, path='/pubmed')
api.add_namespace(openaire_ns, path='/openaire')
api.add_namespace(vis_ns, path='/vis')

app.logger.debug(app.config)
app.logger.debug(app.url_map)


if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5001, debug=True)
