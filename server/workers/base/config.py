import os
from typing import TypedDict, Optional

# Define types for the configurations
class LoggingConfig(TypedDict):
    level: str
    format: str
    datefmt: str

class RedisConfig(TypedDict):
    host: str
    port: int
    db: int
    password: Optional[str]
    client_name: str

# Logging configuration
LOGGING_CONFIG: LoggingConfig = {
    "level": os.getenv("LOG_LEVEL", "INFO"),
    "format": "%(asctime)s %(levelname)-8s %(message)s",
    "datefmt": "%Y-%m-%d %H:%M:%S"
}

# Redis configuration
REDIS_CONFIG: RedisConfig = {
    "host": os.getenv("REDIS_HOST", "localhost"),
    "port": int(os.getenv("REDIS_PORT", 6379)),
    "db": int(os.getenv("REDIS_DB", 0)),
    "password": os.getenv("REDIS_PASSWORD"),
    "client_name": "base_retrieval",
}
