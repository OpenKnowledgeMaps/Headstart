FROM r-base:latest

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt full-upgrade -y && \
  apt install -y links curl vim libcurl4-openssl-dev \
  libxml2-dev libz-dev libpoppler-cpp-dev \
  libopenmpi-dev libzmq3-dev build-essential python3-dev \
  libssl1.1 libssl-dev && \
  apt clean && \
  rm -f /etc/localtime && \
  ln -s /usr/share/zoneinfo/Europe/Vienna /etc/localtime && \
  dpkg --configure -a

RUN apt-get -y install python3 python3-pip

RUN R -e 'options(repos="https://cran.wu.ac.at")' && \
  R -e 'install.packages("remotes")' && \
  R -e 'install.packages("renv", version="0.14.0-5")'

WORKDIR /headstart

COPY workers/dataprocessing/requirements.txt .
RUN pip3 install --no-cache-dir Cython && \
  pip3 install --upgrade pip && \
  pip3 install --no-cache-dir -r requirements.txt

COPY workers/dataprocessing/renv.lock .
COPY workers/dataprocessing/activate.R .
RUN R -e 'renv::consent(provided = TRUE)' && \
  R -e 'setwd("./"); renv::activate(); renv::restore(lockfile = "./renv.lock")'

COPY workers/common ../common
COPY workers/dataprocessing/requirements-e.txt .
RUN pip3 install --no-cache-dir -r requirements-e.txt

COPY workers/dataprocessing ./dataprocessing
COPY preprocessing/resources ./resources
COPY preprocessing/other-scripts ./other-scripts
RUN mkdir -p /var/log/headstart && touch /var/log/headstart/headstart.log

COPY workers/dataprocessing/*.py ./

ENTRYPOINT ["python3", "run_dataprocessing.py"]