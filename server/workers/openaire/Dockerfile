# Dockerfile
FROM r-base:latest

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

ENV DEBIAN_FRONTEND=noninteractive

# Upgrade system and install additional dependencies
RUN apt update && apt full-upgrade -y && \
  apt install -y links curl vim libcurl4-openssl-dev \
  libxml2-dev libz-dev libpoppler-cpp-dev \
  libopenmpi-dev libzmq3-dev build-essential python3-dev \
  libssl1.1 libssl-dev && \
  apt clean && \
  rm -f /etc/localtime && \
  ln -s /usr/share/zoneinfo/Europe/Vienna /etc/localtime && \
  dpkg --configure -a

# Install Python and pip
RUN apt-get -y install python3 python3-pip

# Install automake and additional R packages
RUN apt-get -y install automake && \
  R -e 'options(repos="https://cran.wu.ac.at")' && \
  R -e 'install.packages("remotes")' && \
  R -e 'install.packages("renv", version="0.14.0-5")'

# Set Python-related environment variables and work directory
ENV PYTHONPATH="/headstart/:/headstart/openaire/:/headstart/openaire/src/"
WORKDIR /headstart

# Copy and install Python dependencies
COPY workers/openaire/requirements.txt .
RUN pip3 install --no-cache-dir Cython && \
  pip3 install --upgrade pip && \
  pip3 install --no-cache-dir -r requirements.txt

# Copy R environment lock file and activation script
COPY workers/openaire/renv.lock .
COPY workers/openaire/activate.R .

# Restore R package environment
RUN R -e 'renv::consent(provided = TRUE)' && \
  R -e 'setwd("./"); renv::activate(); renv::restore(lockfile = "./renv.lock")'

# Copy remaining application files
COPY workers/common ../common
COPY workers/openaire/requirements-e.txt .
RUN pip3 install --no-cache-dir -r requirements-e.txt

COPY workers/openaire ./openaire
COPY preprocessing/resources ./resources
COPY preprocessing/other-scripts ./other-scripts
RUN mkdir -p /var/log/headstart && touch /var/log/headstart/headstart.log

COPY workers/openaire/*.py ./

CMD ["python3", "run_openaire.py"]