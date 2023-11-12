FROM python:3.7

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apt-get update
RUN apt-get install -y gcc git libpq-dev

WORKDIR /api
COPY workers/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install git+https://github.com/python-restx/flask-restx
COPY workers/api/src/ ./


