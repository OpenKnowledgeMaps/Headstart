# !/bin/bash
# Running tests for functions from the server/workers/persistence/src/persistence.py
# in a Docker container

cd server || exit
cd workers || exit
cd persistence || exit
docker-compose -f docker/docker-compose-tests.yml up --build