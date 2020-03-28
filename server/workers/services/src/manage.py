from flask_sqlalchemy import SQLAlchemy
from app import create_app
from models import Visualizations, Revisions


app = create_app()
db = SQLAlchemy(app)


if __name__ == '__main__':
    db.create_all()
