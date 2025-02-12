FROM r-base-image

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONPATH="/headstart/:/headstart/pubmed/:/headstart/pubmed/src/"

RUN apt-get update && \
  apt-get install -y python3 python3-pip && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /headstart

COPY workers/common ../common

COPY workers/pubmed/requirements.txt .
RUN pip3 install --no-cache-dir Cython && \
  pip3 install --upgrade pip && \
  pip3 install --no-cache-dir -r requirements.txt

COPY workers/pubmed/renv.lock .
COPY workers/pubmed/activate.R .
RUN R -e 'renv::consent(provided = TRUE)' && \
  R -e 'setwd("/headstart"); renv::activate(); renv::restore(lockfile = "renv.lock")'

COPY workers/pubmed/requirements-e.txt .
RUN pip3 install --no-cache-dir -r requirements-e.txt

COPY workers/pubmed ./pubmed
COPY preprocessing/resources ./resources
COPY preprocessing/other-scripts ./other-scripts

RUN mkdir -p /var/log/headstart && touch /var/log/headstart/headstart.log

COPY workers/pubmed/*.py ./

CMD ["python3", "run_pubmed.py"]