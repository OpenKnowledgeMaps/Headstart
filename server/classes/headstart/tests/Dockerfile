FROM python:3.6.10-slim

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apt-get update
RUN apt-get install -y --no-install-recommends gcc
RUN apt-get install -y --no-install-recommends git

WORKDIR /app
RUN pip install git+https://github.com/python-restx/flask-restx
RUN pip install pytest