FROM python:3.8

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

RUN apt-get update
RUN apt-get install -y gcc git libpq-dev

ENV PYTHONPATH="/headstart/:/headstart/orcid/:/headstart/orcid/src/"

WORKDIR /headstart

# Install core dependencies
COPY workers/orcid/requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Install shared dependencies
COPY workers/common ../common
COPY workers/orcid/requirements-e.txt .
RUN pip3 install --no-cache-dir -r requirements-e.txt

COPY workers/orcid ./
RUN mkdir -p /var/log/headstart && touch /var/log/headstart/headstart.log

CMD ["python3", "src/main.py"]
