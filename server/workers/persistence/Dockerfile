FROM python:3.6.10-slim

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apt-get update
RUN apt-get install -y --no-install-recommends gcc
RUN apt-get install -y --no-install-recommends git

WORKDIR /persistence
COPY workers/persistence/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install git+https://github.com/python-restx/flask-restx
COPY workers/persistence/src/ ./