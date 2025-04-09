import os
import sys
from flask import Flask
from flask_restx import Api
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
import logging

from persistence import persistence_ns

from common.proxy import ReverseProxied

def api_patches(app):
    api_fixed = Api(
        app,
        title="Head Start API",
        description="Head Start API",
        version="0.1",
        prefix='/api',
        doc="/docs")
    if os.getenv("BEHIND_PROXY") == "True":
        api_fixed.behind_proxy = True
    return api_fixed


app = Flask('v1', instance_relative_config=True)
# add logging to docker logs
app.logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(app.logger.level)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_port=1, x_for=1, x_host=1, x_prefix=1)
app.wsgi_app = ReverseProxied(app.wsgi_app)
CORS(app, expose_headers=["Content-Disposition", "Access-Control-Allow-Origin"])

api = api_patches(app)
api.add_namespace(persistence_ns, path='/persistence')

app.logger.debug(app.config)
app.logger.debug(app.url_map)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
