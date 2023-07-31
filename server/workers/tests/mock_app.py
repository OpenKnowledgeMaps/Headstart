import os
from flask import Flask, make_response
from flask_restx import Api
import json
import sys
sys.path.append("workers/persistence/src")
from persistence import persistence_ns
from database import sessions, Base
print(os.environ)

def create_app(config_name):
    app = Flask(__name__)
    initiate_databases(app)

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

    # print(app.url_map)
    return app

def initiate_databases(app):
    with app.app_context():
        for database, Session in sessions.items():
            try:
                session = Session()
                engine = session.get_bind()
                for name, table in Base.metadata.tables.items():
                    if not engine.dialect.has_table(engine.connect(), name):
                        table.create(engine)
            except Exception as e:
                print(database, e)
