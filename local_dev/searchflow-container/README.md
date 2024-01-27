## Developing locally with the full pipeline

A containerized environment for the new search box  has been set up.

To work with this environment, docker and docker-compose are needed.

* Run the example:

`docker-compose up`

* Navigate to `http://localhost:8085/entrypoint.php`

The new search box should be visible, and changes in the code will show after a page reload.

### Adding configs:

The full pipeline consists of three repositories: Headstart, search-flow and project-website (private).

For full pipeline integration, a few configs need to be edited in each repository:

#### Project-website

* project-website/config.php

```
$SITE_URL = "//localhost:8085/";
$HEADSTART_URL = $SITE_URL . "./headstart/";
$COMPONENTS_PATH = "components/";
$LIB_PATH = "lib/";
$SEARCH_FLOW_PATH = "./search-flow/";
$SNAPSHOT_PATH = $HEADSTART_URL . "server/storage/";
```

* project-website/.htaccess

If this file does not exist, it can cause a 404 or other server error right after starting a search. To fix this, create of copy of `settings.htaccess` and rename it to `.htaccess`. The search should now work.

#### Headstart

* server/preprocessing/conf/config_local.ini

```
# Full path to the preprocessing directory
preprocessing_dir = "/var/www/html/headstart/server/preprocessing/"
# Full path to the images directory for the client. Needs to be in the public_html/www directory. Make sure that your webserver has write access to this directory.
images_path = "/var/www/html/headstart/server/paper_preview/"
# Host of the client visualization
host = "localhost/"
# Relative path to the client visualization. Needs to be in the public_html/www directory.
vis_path = "headstart"
# Relative path to the client REST services. Needs to be in the public_html/www directory.
services_path = "headstart/server/services/"
# URL to OKMaps API
api_url = ""
# flavor of API, default: stable
api_flavor = "stabledev"
# The persistence backend to use - either api or legacy
persistence_backend = "legacy"
# The processing backend to use - either api or legacy
processing_backend = "api"



sqlite_db = "/var/www/localstorage/local.sqlite"
```

* config.js

```
module.exports = {
    publicPath : "http://localhost:8085/headstart/dist/",
    skin : "",
    modernFrontendEnabled : false
};
```

and then `npm run prod -- --mode=development`

#### search-flow

* config_local.ini

```
[general]
; Full path to the search-flow
searchflow_path = "//localhost:8085/search-flow/"
; Full path to the headstart distribution
; in a server environment: headstart_path = "//subdomain.domain.tld/pathto/headstart/"
headstart_path = "//localhost:8085/headstart/"
headstart_path_docker_internal =  "//localhost/headstart/"
; Enable or disable debug output
debug = false
; Enable/disable GET requests
enable_get_requests = true
; Enable correct docker-internal curl requests
docker_internal = true

```

* To connect with locally running backends, append this to the docker-compose.yml, where name is the network in which the backend is running:

```

networks:
  default:
    external:
      name: dev_headstart
```

After that, change api_url in preprocessing/conf/config_local.ini to the IP where the proxy is running, which can be found by e.g. `docker network inspect dev_headstart`

```
api_url = "http://172.dd.dd.dd/"
```

#### Swagger documentations

In `docs`:

* Copy the `swagger-searchbox.yml.template` and `swagger.yml.template` files to `swagger-searchbox.yml` and `swagger.yml.template`
* In the .yml-files: Replace `- url: http://localhost` with `- url: http://localhost:8085/`

In `docs/swagger`:

* Copy the `index.html.template` and `searchbox-configurator.html.template` files to ``index.html` and `searchbox-configurator.html`
* In the .html-files: Replace `url: "http://localhost/search-flow/docs/swagger.yml"` with `url: "http://localhost:8085/search-flow/docs/swagger.yml",`