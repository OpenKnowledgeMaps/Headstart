#!/bin/bash

# Defines the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

CONTENTPROVIDERS_FILE="$SCRIPT_DIR/common/common/contentproviders.json"

# Update contentproviders.json cache from the running dev-base-1 container
echo ""
echo "Updating contentproviders.json cache..."
echo ""
docker exec dev-base-1 Rscript /headstart/other-scripts/update_contentproviders.R \
  /headstart/other-scripts \
  /common/contentproviders.json
docker cp dev-base-1:/common/contentproviders.json "$CONTENTPROVIDERS_FILE"

# Commit if the file changed
cd "$SCRIPT_DIR/../.." && git diff --quiet "$CONTENTPROVIDERS_FILE"
if [ $? -ne 0 ]; then
  echo "contentproviders.json changed, committing..."
  git add "$CONTENTPROVIDERS_FILE"
  git commit -m "update of contentprovider.json cache"
fi
cd "$SCRIPT_DIR"

# Define the list of services
services=("api" "persistence" "dataprocessing" "base" "pubmed" "openaire" "orcid" "metrics")

# Receive current commit
service_version="`git rev-parse HEAD`"

echo ""
echo "Building services with version $service_version"
echo ""

# Cycle across all services
for service in ${services[@]}; do
    echo ""
    echo "Building $service"
    echo ""

    # Checks that the --build-for-linux flag has been passed and determines the necessary docker build command
    if [[ "$1" == "--build-for-linux" ]]; then
        echo "Building services with version --platform linux/amd64"
        docker build --platform linux/amd64 -f "$SCRIPT_DIR/../workers/$service/Dockerfile" -t "$service:$service_version" "$SCRIPT_DIR/../"
    else
        echo "Building services without version --platform linux/amd64"
        docker build -f "$SCRIPT_DIR/../workers/$service/Dockerfile" -t "$service:$service_version" "$SCRIPT_DIR/../"
    fi
done

echo ""
echo "Finished building services with version $service_version"
echo ""