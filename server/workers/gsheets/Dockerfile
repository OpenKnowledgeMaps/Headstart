FROM python:3.7

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apt update
RUN apt-get install -y gcc

WORKDIR /headstart
COPY workers/gsheets/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY workers/gsheets/src/ ./gsheets/src
COPY workers/gsheets/run_gsheets.py .
COPY workers/gsheets/token.pickle ./gsheets

ENTRYPOINT python run_gsheets.py
