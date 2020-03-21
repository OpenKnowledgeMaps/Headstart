from flask import Flask, url_for
from flask_restx import Api, apidoc
from flask_cors import CORS
from apis.triple import triple_ns
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug import cached_property
from config import settings
import logging
from flask_restx.swagger import Swagger


log = logging.getLogger(__name__)


def _register_apidoc(self, app):
    conf = app.extensions.setdefault('restx', {})
    custom_apidoc = apidoc.Apidoc('restx_doc', 'flask_restx.apidoc',
                                  template_folder='templates',
                                  static_folder='static',
                                  static_url_path="/api/docs")

    @custom_apidoc.add_app_template_global
    def swagger_static(filename):
        return url_for('restx_doc.static', filename=filename)

    if not conf.get('apidoc_registered', False):
        app.register_blueprint(custom_apidoc)
    conf['apidoc_registered'] = True


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


def api_patches(app):
    Api._register_apidoc = _register_apidoc
    Api.__schema__ = __schema__

    @property
    def fix_specs_url(self):
        if settings.BEHIND_PROXY:
            return url_for(self.endpoint('specs'), _external=False)
        else:
            return url_for(self.endpoint('specs'), _external=True)
    Api.specs_url = fix_specs_url

    api_fixed = Api(
        app,
        title="Head Start API",
        description="Head Start API demo",
        version="0.1",
        prefix='/api',
        doc="/api/docs")

    return api_fixed


app = Flask('v1', instance_relative_config=True)
app.config.from_object('config.settings')
app.config.from_pyfile('settings.py', silent=True)
CORS(app, expose_headers=["Content-Disposition"])

api = Api(app=app, title="Head Start API", version="0.1",
          description="Head Start API demo",
          prefix='/api', doc='/api/docs')
api.add_namespace(triple_ns, path='/triple')
api = ProxyFix(api, x_proto=1, x_host=1)


if __name__ == '__main__':
    app.run(port=5001, debug=True)
