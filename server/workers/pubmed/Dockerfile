FROM rocker/r-ver:4.4.2

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

ENV DEBIAN_FRONTEND=noninteractive

# R packages install as P3M binaries and Python packages as wheels, so the image
# needs no compiler. rocker/r-ver ships one, so it is purged here. The shared
# libraries R itself links against (BLAS/LAPACK, gfortran, OpenMP) are marked as
# manually installed first, so the purge and autoremove leave them in place.
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
        locales \
        python3 \
        python3-pip \
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
    RENV_PATHS_CACHE=/renv/cache \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Binary repository URL, so renv itself does not need compiling either.
RUN R -e 'install.packages("renv", repos="https://packagemanager.posit.co/cran/__linux__/noble/2026-09-22")'

WORKDIR /headstart
COPY workers/pubmed/requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

COPY workers/pubmed/renv.lock .
COPY workers/pubmed/activate.R .

RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("/headstart"); renv::activate(); renv::restore(lockfile = "renv.lock")'

COPY workers/common ../common
COPY workers/pubmed/requirements-e.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements-e.txt

COPY workers/pubmed ./pubmed
COPY preprocessing/resources ./resources
COPY preprocessing/other-scripts ./other-scripts
RUN mkdir -p /var/log/headstart && touch /var/log/headstart/headstart.log

COPY workers/pubmed/*.py ./

CMD ["python3", "run_pubmed.py"]
