# How to run PHP tests

Tests for PHP code run in a container and use PHPUnit as the core technology. To run the tests, you need to follow the steps below:

1. Build docker container:


    ```
    docker build -t php-test server/services/tests/docker
    ```

2. Run container with tests:


    ```
    docker run --rm -v $(pwd)/server:/app php-test phpunit --configuration services/tests/configuration/phpunit.xml
    ```
