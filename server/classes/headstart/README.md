# How to run PHP unit tests with docker

Run all commands from the root directory of Headstart.

### Install development dependencies

Install the dev dependencies (PHPUnit and PHP_CodeSniffer) from `composer.lock`
```
docker-compose -f docker-compose-phptest.yml run composer install
```
Check that PHPUnit runs on PHP 8.4, the version the application runs on

```
docker-compose -f docker-compose-phptest.yml run --rm phpunit84 --version
```

### Run linting

```
docker-compose -f docker-compose-phptest.yml run --rm phpcs ./classes/headstart/persistence/Persistence.php \
                                                       ./classes/headstart/persistence/SQLitePersistence.php \
                                                       ./services/search.php \
                                                       ./services/getLatestRevision.php \
                                                       ./services/getLastVersion.php

```

### Run tests

```
docker-compose -f docker-compose-phptest.yml run phpunit84 --testdox
```

### Update PHPUnit

To update PHPUnit and its dependencies within the version constraints specified in composer.json:

```
docker-compose -f docker-compose-phptest.yml run --rm composer update phpunit/phpunit --with-all-dependencies
```

Commit the updated composer.json and composer.lock to the repository when applicable.
