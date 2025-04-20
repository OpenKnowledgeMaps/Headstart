# multi-stage build to install libstdc++6 from ubuntu:20.04
FROM ubuntu:20.04 AS libstdc
RUN apt-get update && apt-get install -y libstdc++6

# now we can build the rocker/rstudio image and copy the libstdc++6 from the previous stage
FROM rocker/rstudio:3.6.3
COPY --from=libstdc /usr/lib/x86_64-linux-gnu/libstdc++.so.6 /usr/lib/x86_64-linux-gnu/

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libxml2-dev \
    zlib1g-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    make \
    g++ \
    libstdc++6 \
    libuv1-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the CRAN mirror permanently
RUN echo 'options(repos = c(CRAN = "https://cloud.r-project.org"))' >> /usr/local/lib/R/etc/Rprofile.site

# Pre-install renv package
RUN R -e "install.packages('renv', repos='https://cloud.r-project.org')"
RUN R -e "install.packages('jsonlite', repos='https://cloud.r-project.org')"

# install packages from lockfiles

WORKDIR /headstart
COPY server/workers workers

WORKDIR /headstart/workers/dataprocessing
RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("./"); renv::activate(); renv::restore(lockfile="./renv.lock")'

WORKDIR /headstart/workers/pubmed
RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("./"); renv::activate(); renv::restore(lockfile="./renv.lock")'

WORKDIR /headstart/workers/base
RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("./"); renv::activate(); renv::restore(lockfile="./renv.lock")'

WORKDIR /headstart/workers/openaire
RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("./"); renv::activate(); renv::restore(lockfile="./renv.lock")'

WORKDIR /headstart/workers/metrics
RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("./"); renv::activate(); renv::restore(lockfile="./renv.lock")'