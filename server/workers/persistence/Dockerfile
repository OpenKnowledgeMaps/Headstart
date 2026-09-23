FROM python:3.12-slim-trixie

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

# See workers/api/Dockerfile for why 3.12. psycopg2-binary ships wheels, so neither
# libpq-dev nor a compiler is needed.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /persistence
COPY workers/persistence/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY workers/common ../common
COPY workers/persistence/requirements-e.txt ./
RUN pip install --no-cache-dir -r requirements-e.txt
COPY workers/persistence/src/ ./
