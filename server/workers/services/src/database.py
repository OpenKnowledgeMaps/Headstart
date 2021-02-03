from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from config import settings


sessions = {}
sessions[settings.DEV["db"]] = sessionmaker(bind=create_engine(settings.SQLALCHEMY_DATABASE_URI))
for data_integration, database in settings.SQLALCHEMY_BINDS.items():
    sessions[data_integration] = sessionmaker(bind=create_engine(database,
                                                                 max_overflow=15,
                                                                 pool_pre_ping=True,
                                                                 pool_recycle=3600,
                                                                 pool_size=30,
                                                                 isolation_level="AUTOCOMMIT"
                                                                 ))
Base = declarative_base()