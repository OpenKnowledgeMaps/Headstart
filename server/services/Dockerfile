FROM php:8.1-cli

RUN apt-get update && apt-get install -y git unzip curl libcurl4-openssl-dev pkg-config libssl-dev libxml2-dev

RUN pecl install runkit7-4.0.0a6 && docker-php-ext-enable runkit7

RUN curl -sS https://getcomposer.org/installer | php && mv composer.phar /usr/local/bin/composer

RUN composer global require phpunit/phpunit

ENV PATH="/root/.composer/vendor/bin:$PATH"

WORKDIR /app

RUN mkdir -p /path/to/paper_preview/

RUN touch /path/to/paper_preview/test-file.pdf

CMD ["phpunit"]