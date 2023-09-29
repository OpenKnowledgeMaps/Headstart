import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

hosts = []
for host, port in zip(os.getenv("POSTGRES_HOSTS").split(","),
                      os.getenv("POSTGRES_PORTS").split(",")):
    hosts.append(f"{host}:{port}")
host_string = "&host=".join(hosts)

bind_params = {
    "user": os.getenv("POSTGRES_USER"),
    "pw": os.getenv("POSTGRES_PASSWORD"),
    "host": host_string,
    "db": os.getenv("DEFAULT_DATABASE")
}

if len(hosts) == 1:
    engine = create_engine('postgresql+psycopg2://%(user)s:%(pw)s@%(host)s/%(db)s' % bind_params,
                                                    max_overflow=5,
                                                    pool_pre_ping=True,
                                                    pool_recycle=600,
                                                    pool_size=5)
else:
    engine = create_engine('postgresql+psycopg2://%(user)s:%(pw)s@/%(db)s?host=%(host)s&target_session_attrs=read-write' % bind_params,
                                                    max_overflow=5,
                                                    pool_pre_ping=True,
                                                    pool_recycle=600,
                                                    pool_size=5)

Session = sessionmaker(bind=engine)
Base = declarative_base()