from flask import Flask, make_response
import json

def create_app(config_name):
    app = Flask(__name__)

    # Add any configuration settings based on `config_name` (e.g., development, testing, production)
    # ...

    @app.route('/')
    def hello_world():
        return "Hello, World!"
    
    @app.route('/api/stable/base/search')
    def base_search():
        try:
            with open("/app/classes/headstart/tests/test_data/digital-education.json") as f:
                data = json.load(f)
            headers = {}
            headers["Content-Type"] = "application/json"
            return make_response(data, 200, headers)
        except Exception as e:
            print(e)
            return make_response("Error", 500)

    return app
