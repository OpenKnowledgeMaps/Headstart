#!/bin/bash

# Defines the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

build_for_linux=false
skip_contentproviders_update=false
push_to_dockerhub=false

# Parse script flags
for arg in "$@"; do
  case "$arg" in
    --build-for-linux)
      build_for_linux=true
      ;;
    --skip-contentproviders-update)
      skip_contentproviders_update=true
      ;;
    --push)
      push_to_dockerhub=true
      ;;
  esac
done

# Load Docker Hub credentials from dev.env if pushing
if [ "$push_to_dockerhub" = true ]; then
  DEV_ENV="$SCRIPT_DIR/../../local_dev/dev.env"
  if [ ! -f "$DEV_ENV" ]; then
    echo "Error: $DEV_ENV not found. Cannot push without credentials."
    exit 1
  fi
  set -a; source "$DEV_ENV"; set +a

  if [ -z "$DOCKERHUB_USERNAME" ] || [ -z "$DOCKERHUB_TOKEN" ] || [ -z "$DOCKERHUB_ORG" ]; then
    echo "Error: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN, and DOCKERHUB_ORG must be set in local_dev/dev.env"
    exit 1
  fi

  echo "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin

  # Obtain a Docker Hub API token to set repositories private
  dockerhub_jwt=$(curl -s -X POST "https://hub.docker.com/v2/users/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$DOCKERHUB_USERNAME\", \"password\": \"$DOCKERHUB_TOKEN\"}" \
    | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$dockerhub_jwt" ]; then
    echo "Error: Failed to obtain Docker Hub API token."
    exit 1
  fi
fi

# Update contentproviders.json cache if required
if [ "$skip_contentproviders_update" = true ]; then
  echo ""
  echo "Skipping contentproviders.json cache update..."
  echo ""
else
  bash "$SCRIPT_DIR/update_contentproviders_cache.sh"
fi

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
    if [ "$build_for_linux" = true ]; then
        echo "Building services with version --platform linux/amd64"
        docker build --platform linux/amd64 -f "$SCRIPT_DIR/../workers/$service/Dockerfile" -t "$service:$service_version" "$SCRIPT_DIR/../"
    else
        echo "Building services without version --platform linux/amd64"
        docker build -f "$SCRIPT_DIR/../workers/$service/Dockerfile" -t "$service:$service_version" "$SCRIPT_DIR/../"
    fi

    if [ "$push_to_dockerhub" = true ]; then
        remote_tag="$DOCKERHUB_ORG/$service:$service_version"
        echo "Tagging $service:$service_version as $remote_tag"
        docker tag "$service:$service_version" "$remote_tag"
        echo "Pushing $remote_tag"
        docker push "$remote_tag"
    fi
done

if [ "$push_to_dockerhub" = true ]; then
    docker logout
fi

echo ""
echo "Finished building services with version $service_version"
echo ""