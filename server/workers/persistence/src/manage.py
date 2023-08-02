from app import app
from models import Visualizations, Revisions
from sqlalchemy_utils import database_exists, create_database
from database import Base, sessions


if __name__ == '__main__':
    with app.app_context():
        for database, Session in sessions.items():
            try:
                session = Session()
                engine = session.get_bind()
                if not database_exists(engine.url):
                    create_database(engine.url)
                for name, table in Base.metadata.tables.items():
                    if not engine.dialect.has_table(engine.connect(), name):
                        table.create(engine)
            except Exception as e:
                print(database, e)
