# How to run PHP unit tests with docker


On root level of Headstart:


* Install PHP unit 9 which works for PHP 8.0 and 8.2

`docker-compose -f docker-compose-phptest.yml run composer require --dev phpunit/phpunit 9 --ignore-platform-reqs`

* Test that PHPUnit can run for PHP versions 8.0 and 8.2

```
docker-compose -f docker-compose-phptest.yml run phpunit80 --version
docker-compose -f docker-compose-phptest.yml run phpunit82 --version
```

Run linting

```
docker-compose -f docker-compose-phptest.yml run phpcs ./classes/headstart/persistence/Persistence.php \
                                                       ./classes/headstart/persistence/SQLitePersistence.php \
                                                       ./services/search.php \
                                                       ./services/getLatestRevision.php \
                                                       ./services/getLastVersion.php

```

Run tests

```
docker-compose -f docker-compose-phptest.yml run phpunit80
docker-compose -f docker-compose-phptest.yml run phpunit82
```


# How to run end-to-end test with docker

Prepare local configs:

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
database = "test"


```


Run tests

```
docker-compose -f docker-compose-end2endtest.yml run end2endtest
```

## Notes about the end-to-end test setup

The test is designed to test functionality of search.php. 

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
