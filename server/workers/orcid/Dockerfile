FROM python:3.12-slim-trixie

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

# See workers/api/Dockerfile for why 3.12. git is the one build dependency left: the
# pinned pyorcid comes from a git URL. Everything else resolves to a wheel.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH="/headstart/:/headstart/orcid/:/headstart/orcid/src/"

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /headstart

# Install core dependencies
COPY workers/orcid/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install shared dependencies
COPY workers/common ../common
COPY workers/orcid/requirements-e.txt .
RUN pip install --no-cache-dir -r requirements-e.txt

COPY workers/orcid ./
RUN mkdir -p /var/log/headstart && touch /var/log/headstart/headstart.log

CMD ["python3", "src/main.py"]
