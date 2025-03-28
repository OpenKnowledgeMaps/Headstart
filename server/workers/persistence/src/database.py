import os
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import create_engine
from sqlalchemy.engine.base import Engine

def get_host_string() -> str:
    """Construct the host string from environment variables."""
    hosts = os.getenv("POSTGRES_HOSTS", "").split(",")
    ports = os.getenv("POSTGRES_PORTS", "").split(",")

    if not hosts or not ports:
        raise ValueError(
            "POSTGRES_HOSTS and POSTGRES_PORTS environment variables must be set and non-empty."
        )

    return "&host=".join([f"{host}:{port}" for host, port in zip(hosts, ports)])

def create_db_engine() -> "Engine":
    """Create the SQLAlchemy engine based on the provided environment variables."""
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    database = os.getenv("DEFAULT_DATABASE")
    hosts = os.getenv("POSTGRES_HOSTS").split(",")

    if not user or not password or not database:
        raise ValueError(
            "POSTGRES_USER, POSTGRES_PASSWORD, and DEFAULT_DATABASE environment variables must be set."
        )
    
    host_string = get_host_string()


    if len(hosts) == 1:
        connection_string = (
            f"postgresql+psycopg2://{user}:{password}@{host_string}/{database}"
        )
    else:
        connection_string = f"postgresql+psycopg2://{user}:{password}@/{database}?host={host_string}&target_session_attrs=read-write"

    return create_engine(
        connection_string,
        max_overflow=5,
        pool_pre_ping=True,
        pool_recycle=600,
        pool_size=5,
    )

# Create the SQLAlchemy engine
engine = create_db_engine()

# Set up session and base
Session = sessionmaker(bind=engine)
Base = declarative_base()