FROM python:3.8
MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apt-get update
RUN apt-get install -y gcc git libpq-dev

WORKDIR /orcid
COPY workers/orcid/requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
COPY workers/orcid/src/ ./