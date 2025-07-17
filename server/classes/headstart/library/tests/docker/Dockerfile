# Setup PHP using the project version
FROM php:8.2-cli

# Installing dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libcurl4-openssl-dev \
    pkg-config \
    libssl-dev \
    libxml2-dev \
    file

# Installing composer and PHPUnit
RUN curl -sS https://getcomposer.org/installer | php && mv composer.phar /usr/local/bin/composer
RUN composer global require phpunit/phpunit
ENV PATH="/root/.composer/vendor/bin:$PATH"

# Defining working directory inside the container
WORKDIR /app

# Creation of the output-file for saving .pdf files (mocking them)
RUN mkdir -p /path/to/paper_preview/
RUN touch /path/to/paper_preview/test-file.pdf

CMD ["phpunit"]