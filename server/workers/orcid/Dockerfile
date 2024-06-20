FROM python:3.8
MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apt-get update
RUN apt-get install -y gcc git libpq-dev

ENV PYTHONPATH="${PYTHONPATH}:/headstart/:/headstart/orcid/:/headstart/orcid/src/"

WORKDIR /headstart
COPY workers/orcid/requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt


COPY workers/common ./common
COPY workers/orcid ./orcid
RUN mkdir -p /var/log/headstart && touch /var/log/headstart/headstart.log

COPY workers/orcid/*.py ./
ENTRYPOINT python3 run_orcid.py
