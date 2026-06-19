FROM rocker/r-ver:4.4.2

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    locales \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libz-dev \
    libpoppler-cpp-dev \
    libopenmpi-dev \
    libzmq3-dev \
    build-essential \
    && locale-gen en_US.UTF-8 \
    && update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

ENV LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 \
    RENV_PATHS_CACHE=/renv/cache

RUN R -e 'install.packages("renv", repos="https://packagemanager.posit.co/cran/latest")'

WORKDIR /headstart
COPY workers/metrics/renv.lock .
COPY workers/metrics/activate.R .

RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("/headstart"); renv::activate(); renv::restore(lockfile = "renv.lock")'

COPY workers/metrics/test_r_packages.R /usr/local/bin/test_r_packages.R
RUN chmod +x /usr/local/bin/test_r_packages.R

CMD ["R", "--version"]
