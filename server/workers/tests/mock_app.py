import os
import json
import sys
import logging
from flask import Flask, make_response, jsonify
from flask_restx import Api

sys.path.append("workers/persistence/src")
from persistence import persistence_ns
from database import sessions


def create_app(config_name):
    app = Flask(__name__)

    bind_params = {
    "user": os.getenv("POSTGRES_USER"),
    "pw": os.getenv("POSTGRES_PASSWORD"),
    "host": os.getenv("POSTGRES_HOST"),
    "port": os.getenv("POSTGRES_PORT"),
    "db": os.getenv("DEFAULT_DATABASE")
    }
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:%(pw)s@%(host)s:%(port)s/%(db)s' % bind_params
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Add any configuration settings based on `config_name` (e.g., development, testing, production)
    # ...

    @app.route('/hello')
    def hello_world():
        return "Hello, World!"
    
    @app.route('/api/stable/base/search')
    def base_search():
        try:
            with open("/app/workers/tests/test_data/digital-education.json") as f:
                data = json.load(f)
            headers = {}
            headers["Content-Type"] = "application/json"
            return make_response(data, 200, headers)
        except Exception as e:
            print(e)
            return make_response("Error", 500)
        

    api = Api(app)
    api.add_namespace(persistence_ns, path='/api/stable/persistence')

    handler = logging.StreamHandler(sys.stderr)
    handler.setLevel(logging.DEBUG)
    app.logger.setLevel(logging.DEBUG)
    app.logger.addHandler(handler)
    # app.logger.debug(app.config)
    app.logger.debug(app.url_map)

    return app
