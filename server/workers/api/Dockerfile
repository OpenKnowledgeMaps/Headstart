FROM python:3.8

LABEL maintainer="Chris Kittel <christopher.kittel@openknowledgemaps.org>"

RUN apt-get update
RUN apt-get install -y gcc git libpq-dev

WORKDIR /app

COPY ./workers/api/requirements.txt ./api/requirements.txt

RUN pip install --no-cache-dir -r ./api/requirements.txt

COPY ./workers/common ./common

COPY ./workers/api/requirements-e.txt ./api/requirements-e.txt

RUN cd api && pip install --no-cache-dir -r requirements-e.txt && cd ..

COPY ./workers/api/src ./api/src
COPY ./workers/api/tests ./api/tests

CMD ["python", "api/src/app.py"]
