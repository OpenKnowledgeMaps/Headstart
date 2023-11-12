#!/bin/bash

npm run prod -- --mode=development
docker compose --env-file ./local_dev/dev.env stop
docker compose --env-file ./local_dev/dev.env up -d --build
cd ./local_dev/proxy
docker compose down
docker compose up -d