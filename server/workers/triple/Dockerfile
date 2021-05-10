FROM python:3.6.10-alpine3.10

MAINTAINER Chris Kittel "christopher.kittel@openknowledgemaps.org"

RUN apk update
RUN apk add build-base gcc

WORKDIR /headstart
COPY workers/triple/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download xx_ent_wiki_sm
COPY workers/triple/src/ ./triple/src
COPY workers/triple/run_triple.py .
COPY workers/triple/es_config.json .

ENTRYPOINT python run_triple.py
