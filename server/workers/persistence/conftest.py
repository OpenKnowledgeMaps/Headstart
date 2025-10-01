import os

# Setting up envs for tests
os.environ["POSTGRES_USER"] = "test_user"
os.environ["POSTGRES_PASSWORD"] = "test_password"
os.environ["DEFAULT_DATABASE"] = "test_db"
os.environ["POSTGRES_HOSTS"] = "test_host"
os.environ["POSTGRES_PORTS"] = "0000"