FROM python:3.8
LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

RUN apt-get update
RUN apt-get install -y gcc git libpq-dev

WORKDIR /persistence
COPY workers/persistence/requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install git+https://github.com/python-restx/flask-restx

COPY workers/common ../common
COPY workers/persistence/requirements-e.txt ./
RUN pip install --no-cache-dir -r requirements-e.txt
COPY workers/persistence/src/ ./

CMD ["python3", "app.py"]