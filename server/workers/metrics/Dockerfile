FROM r-base-image

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONPATH="/headstart/:/headstart/metrics/:/headstart/metrics/src/"

RUN apt-get update && \
  apt-get install -y python3 python3-pip && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /headstart

COPY workers/common ../common

COPY workers/metrics/requirements.txt .
RUN pip3 install --no-cache-dir Cython && \
  pip3 install --upgrade pip && \
  pip3 install --no-cache-dir -r requirements.txt

COPY workers/metrics/requirements-e.txt .
RUN pip3 install --no-cache-dir -r requirements-e.txt

COPY workers/metrics ./metrics
COPY preprocessing/resources ./resources
COPY preprocessing/other-scripts ./other-scripts

RUN mkdir -p /var/log/headstart && touch /var/log/headstart/headstart.log

COPY workers/metrics/*.py ./

CMD ["python3", "run_metrics.py"]