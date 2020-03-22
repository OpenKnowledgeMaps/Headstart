from flask import Flask, url_for
from flask_restx import Api
from flask_cors import CORS
from apis.triple import triple_ns
from werkzeug.middleware.proxy_fix import ProxyFix
from config import settings
from utils.monkeypatches import api_patches


app = Flask('v1', instance_relative_config=True)
app.config.from_object('config.settings')
app.config.from_pyfile('settings.py', silent=True)
CORS(app, expose_headers=["Content-Disposition"])

api = api_patches(app, settings)
api.add_namespace(triple_ns, path='/triple')
api.app.wsgi_app = ProxyFix(api.app.wsgi_app, x_host=1, x_for=1, x_proto=1)


if __name__ == '__main__':
    app.run(host="localhost", port=5001, debug=True)
