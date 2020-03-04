from flask import Flask


def new_services_app(settings_override=None):
    from blueprints.v2 import app as v2
    app = Flask('v2', instance_relative_config=True)

    app.config.from_object('config.settings')
    app.config.from_pyfile('settings.py', silent=True)

    app.register_blueprint(v2)

    return app
