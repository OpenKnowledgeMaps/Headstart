FROM python:3.9

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

RUN apt-get update
RUN apt-get install -y gcc git libpq-dev

WORKDIR /api

COPY ./workers/api/requirements.txt ./api/requirements.txt

RUN pip install --no-cache-dir -r ./api/requirements.txt

COPY ./workers/common ./common

COPY ./workers/api/requirements-e.txt ./api/requirements-e.txt

RUN cd api && pip install --no-cache-dir -r requirements-e.txt && cd ..

COPY ./workers/api/src ./
COPY ./workers/api/tests ./api/tests
