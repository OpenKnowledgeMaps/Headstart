#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
services=("api" "persistence" "dataprocessing" "base" "pubmed" "openaire")
for service in ${services[@]}; do
    echo ""
    echo "Building $service"
    echo ""
    docker build -f "$SCRIPT_DIR/../workers/$service/Dockerfile" -t "$service:`git rev-parse HEAD`" "$SCRIPT_DIR/../"
done
