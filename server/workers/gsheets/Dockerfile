FROM python:3.6.10-alpine3.10

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apk update
RUN apk add build-base gcc

WORKDIR /headstart
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./gsheets/src
COPY run_gsheets.py .
COPY token.pickle ./gsheets
COPY redis_config.json .

ENTRYPOINT python run_gsheets.py
