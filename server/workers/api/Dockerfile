FROM python:3.8

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apt-get update
RUN apt-get install -y gcc git libpq-dev

WORKDIR /api
COPY workers/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY workers/api/src/ ./


