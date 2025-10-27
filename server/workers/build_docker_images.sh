#!/bin/bash

# Defines the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

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

    # Checks that the --platform-linux flag has been passed and determines the necessary docker build command
    if [[ "$1" == "--platform-linux" ]]; then
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