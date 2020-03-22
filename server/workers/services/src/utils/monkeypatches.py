from flask import url_for
from flask_restx import Api, apidoc
from flask_restx.swagger import Swagger
from werkzeug.utils import cached_property
import logging

log = logging.getLogger(__name__)


class ReverseProxied(object):
    '''Wrap the application in this middleware and configure the
    front-end server to add these headers, to let you quietly bind
    this to a URL other than / and to an HTTP scheme that is
    different than what is used locally.

    :param app: the WSGI application
    '''

    def __init__(self, app):
        self.app = app

    def __call__(self, settings, environ, start_response):
        PREFIX = settings.PROXY_PREFIX
        environ['SCRIPT_NAME'] = PREFIX
        path_info = environ['PATH_INFO']
        if path_info.startswith(PREFIX):
            environ['PATH_INFO'] = path_info[len(PREFIX):]

        scheme = environ.get('HTTP_X_SCHEME', '')
        if scheme:
            environ['wsgi.url_scheme'] = scheme
        return self.app(environ, start_response)


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
    return url_for(self.endpoint('specs'), _external=external)


def api_patches(app, settings):
    Api._register_apidoc = _register_apidoc
    Api.__schema__ = __schema__
    Api.specs_url = specs_url

    api_fixed = Api(
        app,
        title="Head Start API",
        description="Head Start API demo",
        version="0.1",
        prefix='/api',
        doc="/api/docs")
    if settings.BEHIND_PROXY:
        api_fixed.behind_proxy = True
    return api_fixed
