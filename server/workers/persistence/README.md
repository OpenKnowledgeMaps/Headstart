# How to run unit tests

Unit tests can be run locally or in a Docker container. It is also interesting to note that tests can be run directly from this directory in which they are stored or from the top level (root) of the project.

## Running tests locally

Running the tests locally will install all the necessary dependencies on your machine. If you don't want to install all the dependencies, it is better to use the option of running the tests in a Docker container.

#### Run tests from the root level of the repository _(recommended)_:

1. In the root of the project there is a `tests_runners` folder, which contains folders for running tests. Each folder contains two shell-scripts. Since we want to run the script locally, we need to call the script `locally.sh`:

   ```
     sh tests_runners/persistence/locally.sh
   ```

2. After running the script above, all dependencies will be installed on your computer and the tests should run successfully.

#### Run tests from the code folder level:

1. To run the tests without using the shell-script, you will need to navigate to the folder with the tests. For example: `server/workers/persistence`;
2. Now it is necessary to install the dependencies that will be required to run the tests. These can be found in the `requirements.txt` file in the tests folder. Or the following command can be used: `pip install -r ./tests/requirements.txt`.
3. Once the dependencies are installed, tests can be run using `pytest -v` _(for more detailed output)_ or `pytest` _(for shorter output)_ commands.
4. After running the command above, the tests should run successfully.

## Running tests in a Docker container

With this approach, dependencies will not be installed directly on your computer.

#### Run tests from the root level of the repository _(recommended)_:

1. In the root of the project there is a tests_runners folder, which contains folders for running tests. Each folder contains two shell-scripts. Since we want to run the script in a Docker container, we need to call the script `dockerized.sh`:

   ```
     sh tests_runners/persistence/dockerized.sh
   ```

2. After the previous command, a Docker container will be launched, in which all the tests will run. Test results will be visible both in the container logs and in your terminal.

#### Run tests from the code folder level:

1. To run the tests without using the shell-script, you will need to navigate to the folder with the tests. For example: `server/workers/persistence`;
2. Now it is necessary to call the docker-compose file, which will start the container. This can be done with the following command: `docker-compose -f docker/docker-compose-tests.yml up --build`.
3. After the previous command, a Docker container will be launched, in which all the tests will run. Test results will be visible both in the container logs and in your terminal.
