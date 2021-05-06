FROM python:3.6.10-slim

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apt-get update
RUN apt-get install -y --no-install-recommends gcc
RUN apt-get install -y --no-install-recommends git

WORKDIR /headstart
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install git+https://github.com/python-restx/flask-restx
COPY src/ ./
COPY redis_config.json .

CMD gunicorn --workers 10 --threads 2 -b 127.0.0.1:5001 'app:app' --timeout 300
