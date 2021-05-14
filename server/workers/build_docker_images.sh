#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
services=("api" "triple" "gsheets" "dataprocessing" "base" "pubmed" "openaire")
for service in ${services[@]}; do
    docker build -f "$SCRIPT_DIR/../workers/$service/Dockerfile" -t "$service:`git rev-parse HEAD`" "$SCRIPT_DIR/../"
done

