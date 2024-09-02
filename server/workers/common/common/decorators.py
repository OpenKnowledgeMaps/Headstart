import os
import sys
import logging


# Configure the logging
logging.basicConfig(level=os.getenv("LOGLEVEL", "INFO"),
                    format='%(asctime)s %(levelname)-8s %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S')

logger = logging.getLogger(__name__)
handler = logging.StreamHandler(sys.stdout)
logger.addHandler(handler)

def error_logging_aspect(log_level=logging.ERROR):
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.log(log_level, f"Error in {func.__name__}: {e}", exc_info=True)
                # Optionally, re-raise the exception if you want the calling code to handle it
                raise
        return wrapper
    return decorator