from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine


db = SQLAlchemy()
Session = sessionmaker()
