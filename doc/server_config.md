# Installing and configuring the server

If you want to do more than just displaying static CSV files, you need to configure your server components. Also, see [HOWTO: Get the search repos example to work](howto_search_repos.md).

## Requirements

Make sure you have the following packages installed:

* PHP 5.3+ with the following extensions:
  * curl
  * pdo_sqlite
  * mbstring
  * fileinfo
  * xml
* R 3.3+ (https://www.r-project.org/) with current updates, with the following libraries. **Make sure you install these packages for all users, so that Apache can load them.**
  * arsenal (for snapshot tests)
  * logging
  * GMD
  * MASS
  * ecodist
  * jsonlite
  * tm (Version 0.6 - **do not use 0.7**)
  * proxy
  * SnowballC
  * rplos
  * parfossil
  * doParallel
  * rentrez
  * curl
  * tibble
  * data.table
  * stringi
  * stringdist
  * xml2 **(Version 1.0 or higher)**
  * jaod (Currently, a Github repository only: http://github.com/ropenscilabs/jaod. Install with  devtools.)
  * rbace (Currently, a Github repository only: http://github.com/ropenscilabs/rbace. Install with devtools.)
  * ropenaire (For VIPER. Currently, a Github repository only: https://github.com/sckott/ropenaire. Install with devtools.)
  * readr (for ropenair/VIPER)
  * rcrossref (for VIPER) with the async dev version: install with `remotes::install_github("ropensci/rcrossref@async")`
  * rAltmetric
  * plyr (for better data munging)
* phantomjs 2.1+ (http://phantomjs.org/), if you want to use the snapshot feature

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
* calculation->binary: Path to RScript binary
* connection->sqlite_db: Full path to the sqlite datatabase file. For development purposes, duplicate headstart.sqlite in server/storage/ and rename it to a filename of your choice. Enter the path to this file here. **Make sure that your webserver has write & execute permissions to this file and the containing directory.**
* snapshot->snapshot_enabled: Set to 1 to enable snapshot feature, 0 to disable
* snapshot->phantomjs_path: Absolute path to phantomjs binary
* snapshot->getsvg_path: Absolute path to getChartSVG.js
* snapshot->storage_path: Absolute path to the directory, where the snapshots are stored. **Make sure that your webserver has write permissions to this file and the containing directory.**
* snapshot->snapshot_php: PHP File responsible for rendering the bubble in a way to be snapshotted. Relative path to general->host
* snapshot->snapshot_width: Snapshot width
