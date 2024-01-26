FROM php:8.0-apache

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN a2enmod rewrite
RUN apt-get update && apt-get install -y curl libsqlite3-dev php7.4-sqlite libonig-dev libxml2-dev
RUN docker-php-ext-install pdo pdo_sqlite mbstring xml fileinfo

RUN sed -i 's#AllowOverride [Nn]one#AllowOverride All#' /etc/apache2/apache2.conf
RUN mkdir /var/www/localstorage
COPY test.sqlite /var/www/localstorage/local.sqlite
RUN chown -R www-data:www-data /var/www/localstorage