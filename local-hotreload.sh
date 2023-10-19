#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
services=("redis" "db" "api" "persistence" "base" "pubmed" "dataprocessing")


docker-compose --env-file ./local_dev/flavorconfigs/dev.env stop
for service in ${services[@]}; do
    docker-compose --env-file ./local_dev/flavorconfigs/dev.env up -d $service
done
cd ./localdev/proxy
docker-compose down
docker-compose up -d