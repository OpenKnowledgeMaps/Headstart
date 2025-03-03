#!/bin/bash

CONFIG_FILE="$(dirname "$0")/config.js"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "\033[1;33m  Warning: config.js not found in the project root! See the config.example.js file.\033[0m"
fi

npm run prod -- --mode=development
docker compose --env-file ./local_dev/dev.env stop
docker compose --env-file ./local_dev/dev.env up -d --build
cd ./local_dev/proxy
docker compose down
docker compose up -d
docker exec -it dev-persistence-1 python manage.py