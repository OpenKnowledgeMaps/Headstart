FROM rocker/r-ver:4.4.2

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    locales \
    curl \
    vim \
    python3 \
    python3-dev \
    python3-pip \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libz-dev \
    libpoppler-cpp-dev \
    libopenmpi-dev \
    libzmq3-dev \
    libuv1-dev \
    build-essential \
    && locale-gen en_US.UTF-8 \
    && update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 \
    && rm -f /etc/localtime \
    && ln -s /usr/share/zoneinfo/Europe/Vienna /etc/localtime \
    && rm -rf /var/lib/apt/lists/*

ENV LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 \
    RENV_PATHS_CACHE=/renv/cache \
    PYTHONPATH="/headstart/:/headstart/metrics/:/headstart/metrics/src/"

RUN R -e 'install.packages("renv", repos="https://packagemanager.posit.co/cran/latest")'

WORKDIR /headstart
COPY workers/metrics/requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

COPY workers/metrics/renv.lock .
COPY workers/metrics/activate.R .

RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("/headstart"); renv::activate(); renv::restore(lockfile = "renv.lock")'

COPY workers/common ../common
COPY workers/metrics/requirements-e.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements-e.txt

COPY workers/metrics ./metrics
COPY preprocessing/resources ./resources
COPY preprocessing/other-scripts ./other-scripts
RUN mkdir -p /var/log/headstart && touch /var/log/headstart/headstart.log

COPY workers/metrics/*.py ./

CMD ["python3", "run_metrics.py"]
