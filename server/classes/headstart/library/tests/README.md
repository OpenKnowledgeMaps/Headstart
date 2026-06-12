# About this folder

This folder contains tests and their configurations for PHP scripts in the `library` folder.

It contains three main folders:

1. `functions` - folder with the tests;
2. `docker` - folder with the dockerfile;
3. `configuration` - folder for storing test configurations.

Tests implemented using [`PHPUnit`](https://phpunit.de/index.html). All tests are run in the docker container.

## How to run tests

To run tests, you need to follow steps below (run them from the root folder level of the project):

1. Build a docker container:

   ```
   docker build -t php-test server/classes/headstart/library/tests/docker
   ```

2. Run the container with tests:

   ```
   docker run --rm -v $(pwd)/server/classes/headstart/library:/app php-test phpunit --configuration tests/configuration/phpunit.xml
   ```
