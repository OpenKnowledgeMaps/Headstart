from flask import Flask
from flask_restx import Api
from flask_cors import CORS
from apis.triple import triple_ns
from werkzeug.middleware.proxy_fix import ProxyFix
from config import settings
from utils.monkeypatches import ReverseProxied, __schema__, specs_url, _register_apidoc, inject_flasgger


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


app = Flask('v1', instance_relative_config=True)
app = inject_flasgger(app)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_port=1, x_for=1, x_host=1, x_prefix=1)
app.wsgi_app = ReverseProxied(app.wsgi_app)
app.config.from_object('config.settings')
app.config.from_pyfile('settings.py', silent=True)
CORS(app, expose_headers=["Content-Disposition"])

api = api_patches(app, settings)
api.add_namespace(triple_ns, path='/triple')


if __name__ == '__main__':
    app.run(host="localhost", port=5001, debug=True)
