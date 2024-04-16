#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
services=("api" "persistence" "dataprocessing" "base" "pubmed" "openaire")
service_version="`git rev-parse HEAD`"
echo ""
echo "Building services with version $service_version"
echo ""
for service in ${services[@]}; do
    echo ""
    echo "Building $service"
    echo ""
    docker build -f "$SCRIPT_DIR/../workers/$service/Dockerfile" -t "$service:$service_version" "$SCRIPT_DIR/../"
done

echo ""
echo "Finished building services with version $service_version"
echo ""