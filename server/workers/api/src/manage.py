from app import app
from models import Visualizations, Revisions
from database import Base, sessions


if __name__ == '__main__':
    with app.app_context():
        for database, Session in sessions.items():
            try:
                session = Session()
                engine = session.get_bind()
                for name, table in Base.metadata.tables.items():
                    if not engine.dialect.has_table(engine, name):
                        table.create(engine)
            except Exception as e:
                print(database, e)
