from flask import Flask
from apis import api


def new_services_app(settings_override=None):
    flask_app = Flask('v2', instance_relative_config=True)

    flask_app.config.from_object('config.settings')
    flask_app.config.from_pyfile('settings.py', silent=True)

    api.init_app(flask_app)
    return flask_app


if __name__ == '__main__':
    app = new_services_app()
    app.run(port=5001, debug=True)
