from flask_sqlalchemy import SQLAlchemy
from app import app
from models import Visualizations, Revisions, TripleRevisions, TripleVisualizations
from database import db


if __name__ == '__main__':
    db.init_app(app)
    with app.app_context():
        db.create_all(bind=None)
        db.create_all(bind=['triple', 'gsheets', 'openaire'])
