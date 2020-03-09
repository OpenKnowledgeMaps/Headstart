from flask_restx import Api
from .triple import api as triple_api

api = Api(title="Head Start API", version="0.1",
          description="Head Start API demo")
api.add_namespace(triple_api, path='/triple')
