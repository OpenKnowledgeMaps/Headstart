#!/bin/bash

chmod a+x checks/config-js.sh
source ./checks/config-js.sh

chmod a+x checks/ht-access.sh
source ./checks/ht-access.sh

npm run prod -- --mode=development
docker compose --env-file ./local_dev/dev.env stop
docker compose --env-file ./local_dev/dev.env up -d --build

# Populate the shared renv cache for all containers that use R.
# Required on first start or after an R version upgrade — subsequent starts
# are instant because the cache is bind-mounted from local_dev/renv/cache.
for container in dev-dataprocessing-1 dev-base-1 dev-pubmed-1 dev-openaire-1 dev-metrics-1; do
  echo "Restoring R packages in $container..."
  docker exec "$container" R --no-save -e 'renv::restore(prompt = FALSE)' 2>&1 \
    | grep -E "ERROR|error|✔|Installing|Successfully|already up"
done

cd ./local_dev/proxy
docker compose down
docker compose up -d
docker exec -it dev-persistence-1 python manage.py