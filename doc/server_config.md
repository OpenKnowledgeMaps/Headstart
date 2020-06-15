# Installing and configuring the server

If you want to do more than just displaying static CSV files, you need to configure your server components. Also, see [HOWTO: Get the search repos example to work](howto_search_repos.md).

## Requirements

Make sure you have the following packages installed:

* PHP 7.2 with the following extensions:
  * curl
  * pdo_sqlite
  * mbstring
  * fileinfo
  * xml
* R 3.5 (https://www.r-project.org/) with current updates, with the following libraries. **Make sure you install these packages for all users, so that Apache can load them.**
  * arsenal (for snapshot tests)
  * knitr (for test reports)
  * logging
  * GMD (Version 0.3.3) Install with `install.packages("https://cran.r-project.org/src/contrib/Archive/GMD/GMD_0.3.3.tar.gz", repos=NULL, type="source")`
  * MASS
  * vegan
  * jsonlite
  * tm (Version 0.6 - **do not use 0.7**). Install with `devtools::install_version("tm", version="0.6-2")`
  * proxy
  * SnowballC
  * rplos
  * parfossil
  * doParallel
  * curl
  * tibble
  * data.table
  * stringi
  * stringdist
  * xml2 **(Version 1.0 or higher)**
  * jaod
  * NLP
  * slam
  * rentrez (install with `remotes::install_github("sckott/rentrez@http-post")`)
  * rbace (Currently, a Github repository only). Install with `remotes::install_github("ropensci/rbace")`
  * ropenaire (For VIPER. Currently, a Github repository only)  Install with `remotes::install_github("njahn82/ropenaire")`
  * readr (for VIPER)
  * rcrossref (for VIPER) With the async dev version: install with `remotes::install_github("ropensci/rcrossref@async")`
  * rAltmetric
  * plyr (for better data munging)
  * onehot (for feature engineering)
  * textcat (for language recognition)
  * solrium (for interfacing with SOLR servers, install with `devtools::install_github("chreman/solrium")`)
  * tidyr
  * forcats

* Node.js 10.17+ with module puppeteer installed, if you want to use the snapshot feature
  * Depending on the operating system, manual installation of additional dependencies for the chromium renderer are required. Known dependencies under Ubuntu 18.04 are `libasound2 libatk1.0 libatk-bridge2.0 libgtk-3-dev`
  * Under Ubuntu 18.04 the installation of major language character sets for chromium is recommended with `apt-get install -y fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf --no-install-recommends`
  * depending on the environment a separate node-installation with puppeteer is required, that has execution rights for the webserver/www-data user

If you want to use the Hypothes.is annotation tool, make sure to correctly check out submodules; otherwise the PDF modal will result in a 404 error. You can do so by running `git submodule update --init --recursive`

## Configuration

Set the following variables in php.ini:

* max_execution_time = 240
* max_input_time = 480
* memory_limit = 512M
* upload_max_filesize = 100M
* post_max_size = 100M

Duplicate config.ini in server/preprocessing/conf/ and rename it to config_local.ini. Adapt the following variables:

* general->preprocessing_dir: Full path to the preprocessing directory
* general->host: Host of the client visualization
* general->path: Relative path to the client visualization. Needs to be in the public_html/www directory.
* general->images_path: Full path to the images directory for the client. Needs to be in the public_html/www directory. **Make sure that your webserver has write access to this directory.**
* general->services_path: Relative path to the client REST services. Needs to be in the public_html/www directory.
* general->api_url: URL to backend API as provided, or default localhost, e.g. `http://127.0.0.1/api/`
* calculation->binary: Path to RScript binary
* connection->sqlite_db: Full path to the sqlite datatabase file. For development purposes, duplicate headstart.sqlite in server/storage/ and rename it to a filename of your choice. Enter the path to this file here. **Make sure that your webserver has write & execute permissions to this file and the containing directory.**
* connection->linkedcat_solr: URL to the SOLR server, without protocol or additional paths
* connection->linkedcat_user: user string of your provided authentification credentials
* connection->linkedcat_pwd: password string of your provided authentification credentials
* connection->linkedcat_suggest_cache: Absolute path to the cache file for the author suggest functionality, for example "/../server/storage/lc_cache.json". **Make sure that your webserver has write permissions to the containing directory, as the file will be created and rewritten by the service.**

* snapshot->snapshot_enabled: Set to 1 to enable snapshot feature, 0 to disable
* snapshot->node_path: Absolute path to node binary
* snapshot->nodemodules_path: Absolute paths to node_modules folder, where puppeteer is installed
* snapshot->getsvg_path: Absolute path to getChartSVG.js
* snapshot->storage_path: Absolute path to the directory, where the snapshots are stored. **Make sure that your webserver has write permissions to this file and the containing directory.**
* snapshot->snapshot_php: PHP File responsible for rendering the bubble in a way to be snapshotted. Relative path to general->host

## Logging configuration

In the default setting, Headstart will log behavior only to the console. If you want to log to a file, please add following environment variable to your Renviron (in local mode) or Renviron.site (if called on a server). Headstart will then log events to a file on the `INFO` loglevel.
* `HEADSTART_LOGFILE`: Path to a logfile, e.g. `/path/to/logfile.log`. Please make sure that the folder structure exists, e.g. `/path/to/`.
