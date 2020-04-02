## Folder structure

Following backend component containers are currently in `workers`:

* dataprocessing: Executing the machine learning and natural language processing
* services: a Flask-based API, providing endpoints for each integrated data source (e.g. TRIPLE)
* triple: the elasticsearch-connector to TRIPLE

Each comes with a docker file (ending on `.docker`), which is used for creating a container, and a source code folder.

## Setup

### Install docker and docker-compose

Please follow the install instructions for your OS:

* Windows: https://docs.docker.com/docker-for-windows/install/
* Mac: https://docs.docker.com/docker-for-mac/install/
* Ubuntu: https://docs.docker.com/docker-for-mac/install/ (also available for other Linux)

Please follow the install instructions for docker-compose for your OS: https://docs.docker.com/compose/install/

### Windows

It is recommended to install the latest version of [Docker for Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows).
Additionally, following settings may need to be activated:

* [Volume Sharing](https://docs.microsoft.com/en-us/visualstudio/containers/troubleshooting-docker-errors?view=vs-2019)

(In case Docker for Windows does not seem to start, it may be already running in the background and hiding in the task bar menu in the lower right corner.)

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
  	ProxyPass /api http://localhost:5001/api connectiontimeout=120 timeout=120
  	ProxyPassReverse /api http://localhost:5001/api
  	ProxyPass /swaggerui http://localhost:5001/swaggerui
  	ProxyPassReverse /swaggerui http://localhost:5001/swaggerui


</VirtualHost>
```

After that, restart the Apache2 service.

## Configuration

Setting up configurations for each backend service:

Dataprocessing:
* In `server/workers/dataprocessing` copy `example_dataprocessing.env` to `dataprocessing.env` and set the desired loglevel.

Services:
* In `server/workers/services/src/config` copy `example_settings.py` to `settings.py` and change the values for `ENV` (`development` or `production`) and `DEBUG` (`TRUE` or `FALSE`).


TRIPLE ElasticSearch core service:
* In `server/workers/services/triple/` copy `example_es_config.json` to `es_config.json` and fill in the fields.
* In `server/workers/services/triple/` copy `example_triple.env` to `triple.env` and change the values if necessary.


Secure Redis:
* In `server/workers` copy `example_redis_config.json` to `redis_config.json`  and `example_redis.conf` to `redis.conf` and in both files replace "long_secure_password" with a long, secure password (Line 507 in redis.conf, parameter `requirepass`).


### Starting the backend services with docker-compose

Following commands have to be executed from the root folder of the repository, where `docker-compose.yml` is located.

**Build images**

* on Linux:
```
docker-compose build
```

* on Windows:
```
docker-compose -f docker-compose_win.yml build
```

**Start services and send them to the docker daemon**

* on Linux:
```
docker-compose up -d
```

* on Windows:
```
docker-compose -f docker-compose_win.yml up -d
```

**All in one:**

* on Linux:
```
docker-compose up -d --build
```

* shut service down

* on Linux:
```
docker-compose down
```

* on Windows:
```
docker-compose -f docker-compose_win.yml down
```

### Deploying the example:

Use a deployment script, or manually deploy an example (currently only TRIPLE is integrated in this way) as described in [HOWTO: search repos](../../doc/howto_search_repos.md):
