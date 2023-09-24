import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base


bind_params = {
    "user": os.getenv("POSTGRES_USER"),
    "pw": os.getenv("POSTGRES_PASSWORD"),
    "host": os.getenv("POSTGRES_HOST"),
    "port": os.getenv("POSTGRES_PORT"),
    "db": os.getenv("DEFAULT_DATABASE")
}

Session = sessionmaker(bind=create_engine('postgresql+psycopg2://%(user)s:%(pw)s@/%(db)s?host=%(host)s:7432&host=%(host)s:6432&target_session_attrs=read-write' % bind_params,
                                                                 max_overflow=5,
                                                                 pool_pre_ping=True,
                                                                 pool_recycle=600,
                                                                 pool_size=5))
Base = declarative_base()