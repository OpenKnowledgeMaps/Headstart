from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from config import settings


db = SQLAlchemy()
sessions = {}
sessions[settings.POSTGRES["db"]] = sessionmaker(bind=create_engine(settings.SQLALCHEMY_DATABASE_URI))
for data_integration, database in settings.SQLALCHEMY_BINDS.items():
    sessions[data_integration] = sessionmaker(bind=create_engine(database, pool_recycle=3600))
