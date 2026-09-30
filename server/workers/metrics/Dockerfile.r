FROM rocker/r-ver:4.4.2

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

ENV DEBIAN_FRONTEND=noninteractive

# Same base as Dockerfile, without the Python layer: R packages install as P3M
# binaries, so the compiler that rocker/r-ver ships is purged. See Dockerfile.
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends locales libuv1t64 \
    && apt-mark manual libgfortran5 libgomp1 libquadmath0 \
        libblas3 liblapack3 libopenblas0-pthread \
    && apt-get purge -y \
        gcc g++ gfortran cpp gcc-13 g++-13 gfortran-13 cpp-13 \
        libc6-dev libc-dev-bin linux-libc-dev libcrypt-dev \
        libgcc-13-dev libgfortran-13-dev libstdc++-13-dev \
        libblas-dev liblapack-dev libopenblas-dev libopenblas-pthread-dev \
        libjpeg-turbo8-dev binutils make \
    && apt-get autoremove --purge -y \
    && locale-gen en_US.UTF-8 \
    && update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

ENV LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 \
    RENV_PATHS_CACHE=/renv/cache

RUN R -e 'install.packages("renv", repos="https://packagemanager.posit.co/cran/__linux__/noble/2026-09-22")'

WORKDIR /headstart
COPY workers/metrics/renv.lock .
COPY workers/metrics/activate.R .

RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("/headstart"); renv::activate(); renv::restore(lockfile = "renv.lock")'

COPY workers/metrics/test_r_packages.R /usr/local/bin/test_r_packages.R
RUN chmod +x /usr/local/bin/test_r_packages.R

CMD ["R", "--version"]
