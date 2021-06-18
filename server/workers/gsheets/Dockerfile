FROM python:3.6.10-alpine3.10

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apk update
RUN apk add build-base gcc

WORKDIR /headstart
COPY workers/gsheets/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY workers/gsheets/src/ ./gsheets/src
COPY workers/gsheets/run_gsheets.py .
COPY workers/gsheets/token.pickle ./gsheets

ENTRYPOINT python run_gsheets.py
