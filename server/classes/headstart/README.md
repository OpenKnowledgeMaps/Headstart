# How to run PHP unit tests with docker


On root level of Headstart:


* Install the dev dependencies (PHPUnit and PHP_CodeSniffer) from `composer.lock`

`docker-compose -f docker-compose-phptest.yml run composer install`

* Test that PHPUnit runs on PHP 8.2, the version the application runs on

```
docker-compose -f docker-compose-phptest.yml run phpunit82 --version
```

Run linting

```
docker-compose -f docker-compose-phptest.yml run phpcs ./classes/headstart/persistence/Persistence.php \
                                                       ./classes/headstart/persistence/SQLitePersistence.php \
                                                       ./services/search.php \
                                                       ./services/getLatestRevision.php \
                                                       ./services/getLastVersion.php

```

Run tests

```
docker-compose -f docker-compose-phptest.yml run phpunit80
docker-compose -f docker-compose-phptest.yml run phpunit82
```


