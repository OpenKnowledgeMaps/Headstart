FROM python:3.6.10-alpine3.10

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apk update
RUN apk add build-base gcc

WORKDIR /headstart
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download xx_ent_wiki_sm
COPY src/ ./triple/src
COPY run_triple.py .
COPY es_config.json .
COPY redis_config.json .

ENTRYPOINT python run_triple.py
