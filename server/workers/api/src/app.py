import os
import sys
from flask import Flask
from flask_restx import Api
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
import logging

from apis.triple import triple_ns
from apis.gsheets import gsheets_ns
from apis.base import base_ns
from apis.pubmed import pubmed_ns
from apis.openaire import openaire_ns
from apis.create_vis import vis_ns


class ReverseProxied(object):
    '''Wrap the application in this middleware and configure the
    front-end server to add these headers, to let you quietly bind
    this to a URL other than / and to an HTTP scheme that is
    different than what is used locally.

    location /myprefix {
        proxy_pass http://192.168.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Scheme $scheme;
        proxy_set_header X-Script-Name /myprefix;
        }

    :param app: the WSGI application
    '''
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        script_name = environ.get('HTTP_X_SCRIPT_NAME', '')
        if script_name:
            environ['SCRIPT_NAME'] = script_name
            path_info = environ['PATH_INFO']
            if path_info.startswith(script_name):
                environ['PATH_INFO'] = path_info[len(script_name):]

        scheme = environ.get('HTTP_X_SCHEME', '')
        if scheme:
            environ['wsgi.url_scheme'] = scheme
        return self.app(environ, start_response)

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
