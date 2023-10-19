#!/bin/bash

docker compose --env-file ./local_dev/flavorconfigs/dev.env stop
docker compose --env-file ./local_dev/flavorconfigs/dev.env up -d
cd ./local_dev/proxy
docker compose down
docker compose up -d