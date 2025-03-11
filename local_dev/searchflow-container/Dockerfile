FROM php:8.0-apache

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN a2enmod rewrite

RUN apt-get update && apt-get install -y \
    curl libsqlite3-dev php7.4-sqlite libonig-dev libxml2-dev \
    gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
    libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
    fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

RUN docker-php-ext-install pdo pdo_sqlite mbstring xml fileinfo

ENV NVM_DIR /usr/local/nvm
RUN mkdir -p $NVM_DIR && curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

ENV NODE_VERSION 10.17.0
RUN bash -c 'source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION && nvm use default'

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
ENV NPM_PATH  $NVM_DIR/versions/node/v$NODE_VERSION/bin/npm
RUN $NPM_PATH install -g puppeteer@^2.0.0 --unsafe-perm=true --allow-root

RUN sed -i 's#AllowOverride [Nn]one#AllowOverride All#' /etc/apache2/apache2.conf