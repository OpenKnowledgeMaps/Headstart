FROM rocker/r-ver:4.4.2

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
        locales \
        python3 \
        python3-pip \
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
COPY workers/dataprocessing/requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

COPY workers/dataprocessing/renv.lock .
COPY workers/dataprocessing/activate.R .

# All packages are P3M binaries except GMD (CRAN-archived, contains C code), which is
# compiled here with the toolchain that rocker/r-ver ships. The restore runs in a
# session where the /headstart project is active, so it fills the project library,
# and with the renv cache off, so the library holds real copies instead of links
# into /renv/cache, which compose hides behind a host mount. The runtime
# renv::restore() in run_vis_layout.R then finds everything installed and never
# needs a compiler or network access.
RUN R -e 'renv::consent(provided = TRUE)' \
    && R -e 'renv::activate("/headstart")' \
    && RENV_CONFIG_CACHE_ENABLED=FALSE R -e 'renv::restore(lockfile = "renv.lock", prompt = FALSE)' \
    && rm -rf /root/.cache/R

# With GMD built, the compiler goes. The shared libraries R itself links against
# (BLAS/LAPACK, gfortran, OpenMP) are marked as manually installed first, so the
# purge and autoremove leave them in place.
RUN apt-mark manual libgfortran5 libgomp1 libquadmath0 \
        libblas3 liblapack3 libopenblas0-pthread \
    && apt-get purge -y \
        gcc g++ gfortran cpp gcc-13 g++-13 gfortran-13 cpp-13 \
        libc6-dev libc-dev-bin linux-libc-dev libcrypt-dev \
        libgcc-13-dev libgfortran-13-dev libstdc++-13-dev \
        libblas-dev liblapack-dev libopenblas-dev libopenblas-pthread-dev \
        libjpeg-turbo8-dev binutils make \
    && apt-get autoremove --purge -y \
    && rm -rf /var/lib/apt/lists/*

COPY workers/common ../common
COPY workers/dataprocessing/requirements-e.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements-e.txt

COPY workers/dataprocessing ./dataprocessing
COPY preprocessing/resources ./resources
COPY preprocessing/other-scripts ./other-scripts
RUN mkdir -p /var/log/headstart && touch /var/log/headstart/headstart.log

COPY workers/dataprocessing/*.py ./
ENTRYPOINT ["python3", "run_dataprocessing.py"]
