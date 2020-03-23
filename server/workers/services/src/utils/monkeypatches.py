import os
import json
import yaml
import logging
from flask import url_for
from flask_restx import apidoc
from flask_restx.swagger import Swagger
from werkzeug.utils import cached_property

log = logging.getLogger(__name__)


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


# from https://github.com/noirbizarre/flask-restplus/issues/517
def _register_apidoc(self, app):
    conf = app.extensions.setdefault('restx', {})
    custom_apidoc = apidoc.Apidoc('restx_doc', 'flask_restx.apidoc',
                                  template_folder='templates',
                                  static_folder='static',
                                  static_url_path="/swaggerui")

    @custom_apidoc.add_app_template_global
    def swagger_static(filename):
        return url_for('restx_doc.static', filename=filename)

    if not conf.get('apidoc_registered', False):
        app.register_blueprint(custom_apidoc)
    conf['apidoc_registered'] = True


# from https://github.com/noirbizarre/flask-restplus/pull/596/files
# make swagger work behind reverse proxy

@cached_property
def __schema__(self):
    '''
    The Swagger specifications/schema for this API
    :returns dict: the schema as a serializable dict
    '''
    if not self._schema:
        try:
            self._schema = Swagger(self).as_dict()
            if self.behind_proxy and "host" in self._schema:
                del self._schema["host"]
        except Exception:
            # Log the source exception for debugging purpose
            # and return an error message
            msg = 'Unable to render schema'
            log.exception(msg)  # This will provide a full traceback
            return {'error': msg}
    return self._schema


@property
def specs_url(self):
    '''
    The Swagger specifications absolute url (ie. `swagger.json`)
    Use a relative url when behind a proxy.
    :rtype: str
    '''
    if self.behind_proxy:
        # Use relative URL.
        external = False
    else:
        external = True
    url = url_for(self.endpoint('specs'), _external=external)
    # from https://github.com/noirbizarre/flask-restplus/pull/226/files
    if self.app.config.get('SWAGGER_BASEPATH', ''):
        prefix = url.split('/swagger.json')[0]
        url = prefix + self.app.config.get('SWAGGER_BASEPATH', '') + '/swagger.json'
        return url
    return url


def inject_flasgger(app):
    from flasgger import Swagger
    with open("config/swagger.json") as infile:
        specs = json.load(infile)
        swagger = yaml.load(json.dumps(specs))
    swagger["host"] = os.getenv("HOST_IP", "localhost:5001")
    if swagger["host"] == "localhost:5001":
        swagger["schemes"] = ["http"]
    Swagger(app, template=swagger, config=getSwaggerConfig())
    return app


def getSwaggerConfig():
    return {
        "headers": [
        ],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,  # all in
                "model_filter": lambda tag: True,  # all in
            }
        ],
        "static_url_path": "/flasgger_static",
        "static_folder": "static",  # must be set by user
        "swagger_ui": True,
        "specs_route": "/api/"
    }
