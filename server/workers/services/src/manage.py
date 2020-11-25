from flask_sqlalchemy import SQLAlchemy
from app import app
from models import Visualizations, Revisions
from database import db, sessions


if __name__ == '__main__':
    db.init_app(app)
    with app.app_context():
        for database, Session in sessions.items():
            try:
                session = Session()
                engine = session.get_bind()
                for name, table in Visualizations.metadata.tables.items():
                    if not engine.dialect.has_table(engine, name):
                        table.create(engine)
            except Exception as e:
                print(database, e)
