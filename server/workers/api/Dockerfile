FROM python:3.12-slim-trixie

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

# Python 3.12 rather than 3.13: numpy 1.26.x, the fleet-wide pin, has no cp313 wheels,
# and 3.12 is what the R workers get from their Ubuntu 24.04 base.
# No build toolchain is installed -- every dependency resolves to a wheel.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /api

COPY ./workers/api/requirements.txt ./api/requirements.txt

RUN pip install --no-cache-dir -r ./api/requirements.txt

COPY ./workers/common ./common

COPY ./workers/api/requirements-e.txt ./api/requirements-e.txt

# Run from ./api so the `-e ../common` in requirements-e.txt resolves to /api/common
# (pip resolves relative paths against the working directory, not the file).
RUN cd api && pip install --no-cache-dir -r requirements-e.txt

COPY ./workers/api/src ./
