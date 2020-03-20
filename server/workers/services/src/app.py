from flask import Flask
from flask_restx import Api
from flask_cors import CORS
from apis.triple import triple_ns


app = Flask('v1', instance_relative_config=True)
app.config.from_object('config.settings')
app.config.from_pyfile('settings.py', silent=True)
CORS(app, expose_headers=["Content-Disposition"])

api = Api(app=app, title="Head Start API", version="0.1",
          description="Head Start API demo",
          prefix='/api',
          doc='/api/docs')
api.add_namespace(triple_ns, path='/triple')


if __name__ == '__main__':
    app.run(port=5001, debug=True)
