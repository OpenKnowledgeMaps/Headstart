# Dockerfile.r
FROM rocker/r-ver:4.4.2

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

ENV DEBIAN_FRONTEND=noninteractive

# R base image only, like its predecessor: no packages are installed, so the
# compiler that rocker/r-ver ships is purged. The shared libraries R itself links
# against (BLAS/LAPACK, gfortran, OpenMP) are marked as manually installed first,
# so the purge and autoremove leave them in place.
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends locales \
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
    LANG=en_US.UTF-8

CMD ["R", "--version"]
