# Installing and configuring the server

If you want to do more than just displaying static CSV files, you need to configure your server components.

## Requirements

Make sure you have the following packages installed:

* PHP 5.3+ with the following extensions: 
  * curl
  * pdo_sqlite
* R 3.1.3+ (https://www.r-project.org/) with the following libraries
 * GMD
 * MASS
 * ecodist
 * jsonlite
 * tm
 * proxy
 * SnowballC
 * rplos
 * parfossil
 * doParallel
 * rentrez
 * curl
 * tibble
 * data.table
 * xml2

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
* connection->sqlite_db: Full path to the sqlite datatabase file. Make sure that your webserver has write access to this file. For development purposes, duplicate headstart.sqlite in server/storage/ and rename it to a filename of your choice. **Enter the path to this file here.**
