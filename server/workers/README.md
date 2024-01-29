## This documentation is not up-to-date and following it will not result in a running server backend for Headstart. We apologize for any inconvenience this may cause and ask for patience until the public documentation has been updated.


## Folder structure

Following backend component containers are currently in `workers`:

* dataprocessing: Executing the machine learning and natural language processing
* services: a Flask-based API, providing endpoints for each integrated data source

Each comes with a docker file (ending on `.docker`), which is used for creating a container, and a source code folder.

## Setup

### Install docker and docker-compose

Please follow the install instructions for your OS:

* Mac: https://docs.docker.com/docker-for-mac/install/
* Ubuntu: https://docs.docker.com/docker-for-mac/install/ (also available for other Linux)

Please follow the install instructions for docker-compose for your OS: https://docs.docker.com/compose/install/

### Setting up the Apache2 reverse proxy

Following Apache2 mods have to be installed and enabled:

* ssl
* proxy
* proxy_balancer
* proxy_http

Possibly also following modules need to be installed and enabled:
* mod_slotmem_shm

The following lines have to be added to the appropriate sites-available config of Apache2 webserver:

```
<VirtualHost *:80>
    #
    # other config

    # Proxy server settings for Head Start API
        <Location /api>
            Deny from all    
            Allow from 127.0.0.1
            ProxyPass http://127.0.0.1:8080/
            ProxyPassReverse http://127.0.0.1/api
        </Location>

</VirtualHost>
```

After that, restart the Apache2 service.

## Configuration

Setting up configurations for each backend service:

Dataprocessing:
* In `server/workers/dataprocessing` copy `example_dataprocessing.env` to `dataprocessing.env` and set the desired loglevel.

Services:
* In `server/workers/services/src/config` copy `example_settings.py` to `settings.py` and change the values for `ENV` (`development` or `production`) and `DEBUG` (`TRUE` or `FALSE`).
* In `settings.py` you can also configure databases.

Secure Redis:
* In `server/workers` copy `example_redis.conf` to `redis.conf` and replace "long_secure_password" with a long, secure password (Line 507 in redis.conf, parameter `requirepass`).

Secure Postgres:
* In `server/workers` duplicate `example_pg_hba.conf` to `pg_hba.conf` and review the settings. The default values should be ok for a default deployment (host connections are only allowed for user "headstart" with an md5-hashed password), but you may want to change access rights.


Overall deployment environment variables:
PostgreSQL service:
* In `server/workers/flavorconfigs` folder create a new `flavorname.env` from the `example.env` and fill in the environment variables with the correct login data.
  * This includes Postgresql and redis settings


* Manual database creation for Postgres:

Enter container: `docker exec -it VARYINGNAME_db_1 psql -U headstart`

Execute command: `CREATE DATABASE databasename;`

Exit the container and re-enter it as normal user: `docker exec -it VARYINGNAME_persistence_1 /bin/bash`

Execute command: `python manage.py`

* In `preprocessing/conf/config_local.ini` change "databasename" to the dev/production database name for the specific integration. This should be in line with the database names provided in `settings.py`


* Running backup processes for postgres-volumes:

https://hub.docker.com/p/loomchild/volume-backup

### Adding a new versioned "flavor" of the backend


1. Make changes to code in `server/workers` (any API /integration, …)
1. Commit changes
1. Checkout commit (make note of commit hash)
1. Run `server/workers/build_docker_images.sh`
1. Create new {flavor}.env in `server/workers/flavorconfigs/` using `example.env` as template. Set the “COMPOSE_PROJECT_NAME={flavor}” and the SERVICE_VERSION={commit hash} to the values from step 3.
1. Run `docker-compose up --env-file server/workers/flavorconfigs/flavor.env -d` to start the services
1. Add new entry to `server/workers/proxy/templates/default.conf.templates`
1. Add flavored networks to `server/workers/proxy/docker-compose.yml` so that the Nginx-proxy knows where to find the specific versioned services
1. Down and up the proxy service from `server/workers/proxy` working directory
1. Test by e.g. `curl -vvvv localhost/api/{flavor}/base/service_version`


### Starting a specific versioned "flavor" of the backend services with docker-compose

Following commands have to be executed from the root folder of the repository, where `docker-compose.yml` is located.

**Start services and send them to the docker daemon**

```
docker-compose --env-file server/workers/flavorconfigs/flavor.env up -d
```


**Shutting service down**

```
docker-compose --env-file server/workers/flavorconfigs/flavor.env down
```


### Adding a new service to the backend

1. Add service configuration in docker-compose.yml
	1. Add required environment variables that need to be passed from .env to container in docker-compose.yml
1. Add service related changes in build-docker-images.sh
	1. Add service to build list
1. Add service source code and Dockerfile in a new folder in `server/workers`
1. Add new env variables to .env files


### Integrating with clients

In `server/preprocessing/conf/config_local.ini` change the following configs:
```
# URL to OKMaps API
api_url = "http://127.0.0.1/api/"
# flavor of API, default: "stable"
api_flavor = "stable"
# The persistence backend to use - either api or legacy
persistence_backend = "api"
# The processing backend to use - either api or legacy
processing_backend = "api"
```


## Updating R dependencies

1. start rstudio
2. navigate to folder of worker file, e.g. /workers/base: setwd("~/projects/OpenKnowledgeMaps/Headstart/server/workers/base")
3. initiate renv with renv::activate()
4. check if dependencies.R is up to date
5. make any updates to packages as required, e.g. installing remotes::install_github('OpenKnowledgeMaps/rbace', force=TRUE)
6. update renv.lock file with renv::snapshot()
7. review lock file
8. if OK, commit lockfile
