FROM rocker/rstudio:3.6.3

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libxml2-dev \
    zlib1g-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the CRAN mirror permanently
RUN echo 'options(repos = c(CRAN = "https://cloud.r-project.org"))' >> /usr/local/lib/R/etc/Rprofile.site

# Pre-install renv package
RUN R -e "install.packages('renv', repos='https://cloud.r-project.org')"
RUN R -e "install.packages('jsonlite', repos='https://cloud.r-project.org')"

# install packages from lockfiles

WORKDIR /headstart/workers/dataprocessing
RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("/headstart/workers/dataprocessing"); renv::activate(); renv::restore()'

    WORKDIR /headstart/workers/pubmed
RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("/headstart/workers/pubmed"); renv::activate(); renv::restore()'

WORKDIR /headstart/workers/base
RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("/headstart/workers/base"); renv::activate(); renv::restore()'

WORKDIR /headstart/workers/openaire
RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("/headstart/workers/openaire"); renv::activate(); renv::restore()'

WORKDIR /headstart/workers/metrics
RUN R -e 'renv::consent(provided = TRUE)' && \
    R -e 'setwd("/headstart/workers/metrics"); renv::activate(); renv::restore()'