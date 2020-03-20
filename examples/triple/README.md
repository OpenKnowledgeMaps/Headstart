## Setup

### Install docker and docker-compose

Please follow the install instructions for your OS:

* Windows: https://docs.docker.com/docker-for-windows/install/
* Mac: https://docs.docker.com/docker-for-mac/install/
* Ubuntu: https://docs.docker.com/docker-for-mac/install/ (also available for other Linux)

Please follow the install instructions for docker-compose for your OS: https://docs.docker.com/compose/install/

## Usage

### Setting up the Apache2 reverse proxy

Following Apache2 mods have to be installed and enabled:

* ssl
* proxy
* proxy_balancer
* proxy_http

The following lines have to be added to the appropriate sites-available config of Apache2 webserver:

```
<VirtualHost *:80>
    #
    # other config

    ProxyPass /api http://localhost:5001/api
    ProxyPassReverse /api http://localhost:5001/api
    ProxyPass /swaggerui http://localhost:5001/swaggerui
    ProxyPassReverse /swaggerui http://localhost:5001/swaggerui
</VirtualHost>
```

After that, restart the Apache2 service.

### Starting the backend service with docker-compose

Setting up configs:

* ElasticSearch core service: In `server/workers/services/triple/` copy `config_example.json` to `config.json` and fill in the fields.


Following commands have to be executed from the root folder of the repository, where `docker-compose.yml` is located.

* build images
```
docker-compose build
```

* start services and send them to the docker daemon
```
docker-compose up -d
```

* shut service down
```
docker-compose down
```
