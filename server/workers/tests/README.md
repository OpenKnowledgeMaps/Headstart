# How to run end-to-end test with docker

## Prepare local configs:

* Adapt the following settings in `server/preprocessing/conf/config_local.ini`:

```

[general]
# Full path to the preprocessing directory
preprocessing_dir = "/var/www/html/server/preprocessing/"
# Full path to the images directory for the client. Needs to be in the public_html/www directory. Make sure that your webserver has write access to this directory.
images_path = "/var/www/html/server/paper_preview/"
# Host of the client visualization
host = "localhost/"
# Relative path to the client visualization. Needs to be in the public_html/www directory.
vis_path = "headstart"
# Relative path to the client REST services. Needs to be in the public_html/www directory.
services_path = "server/services/"
# URL to OKMaps API
api_url = "http://end2endtest/api/"
# flavor of API, default: stable
api_flavor = "stable"
# The persistence backend to use - either api or legacy
persistence_backend = "legacy"
# The processing backend to use - either api or legacy
processing_backend = "api"

[connection]
# Full path to the sqlite datatabase file. Make sure that your webserver has write access to this file. For development purposes, duplicate headstart.sqlite in server/storage/ and rename it to a filename of your choice. Enter the path to this file here.
sqlite_db = "/var/www/localstorage/local.sqlite"

# PostgreSQL database
database = "testdb"

```

* Duplicate the postgres config files `pg_hba_test.conf` and `postgresql_test.conf` in `tests/test_data` and rename the duplicates to `pg_hba_test_local.conf` and `postgresql_test_local.conf`

* Make sure that the postgres container is correctly referred to in `docker-compose-end2endtest.yml` and `postgresql_test_local.conf`:

In `docker-compose-end2endtest.yml`, the POSTGRES_HOST should be the name of the db container as assigned by your local Docker, this could be either `headstart_db_1` or `headstart-db-1`, depending on your Docker system and OS.

```
  end2endtest:
    build:
      context: ./server/workers/tests
      dockerfile: ./Dockerfile_tests
    hostname: "end2endtest"
    environment:
      POSTGRES_USER: "testuser"
      POSTGRES_PASSWORD: "testpassword"
      POSTGRES_HOST: "headstart_db_1"
```
In `postgresql_test_local.conf` the `listen_addresses` should include the correct name of the db container as well:

```
listen_addresses = 'localhost,headstart_db_1,headstart-db-1'
```

Run tests

```
docker-compose -f docker-compose-end2endtest.yml run end2endtest
```

## Notes about the end-to-end test setup

The test is designed to test functionality of search.php and data retrieval endpoints, e.g. getLatestRevision.php . 

It consists of multiple containers which replicate a production setup:

* A testrunner, which also includes a mock dataprocessing API as a fixture
* A backend-container with a Apache2/PHP environment for running the server/services endpoints
* A database container

During a test, the following routing within the docker-network of the test containers happens:

1. A test from within the testrunner calls a services endpoint in the backend container, e.g. search.php
1. Search.php calls the mock dataprocessing API, which runs as a test fixture in the testrunner container
1. The mock API returns a result, e.g. a data-JSON to search.php
1. The services endpoint (search.php) then proceeds and returns a response to the test
1. The test performs its assertions
1. The testrunner proceeds to the next test



## Legacy tests (without docker)


Currently, some tests require the dockerized backend to run when testing e.g. data clients or the dataprocessing. This is because the R-parts of the backend are not easily integrated into the current testing framework.

Tests are run from the server/workers folder by running pytest in an environment (e.g. anaconda) that has the requirements (requirements.txt) installed.

Additionally, language data (e.g. stopwords) need to be downloaded for NLTK `python -m nltk.downloader all`
