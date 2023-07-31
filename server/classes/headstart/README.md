# How to run PHP unit tests with docker


On root level of Headstart:


* Install PHP unit 9 which works for PHP 8.0 and 8.2

`docker-compose -f docker-compose-phptest.yml run composer require --dev phpunit/phpunit 9 --ignore-platform-reqs`

* Test that PHPUnit can run for PHP versions 8.0 and 8.2

```
docker-compose -f docker-compose-phptest.yml run phpunit80 --version
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


