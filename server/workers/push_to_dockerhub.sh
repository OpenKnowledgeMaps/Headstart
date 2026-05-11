#!/bin/bash

# Defines the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

service_version="$1"
shift
services=("$@")

# Load credentials from dev.env
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
  docker logout
  exit 1
fi

for service in "${services[@]}"; do
  remote_tag="$DOCKERHUB_ORG/$service:$service_version"
  echo "Tagging $service:$service_version as $remote_tag"
  docker tag "$service:$service_version" "$remote_tag"
  echo "Pushing $remote_tag"
  docker push "$remote_tag"
  echo "Setting $DOCKERHUB_ORG/$service to private"
  curl -s -X PATCH "https://hub.docker.com/v2/repositories/$DOCKERHUB_ORG/$service/" \
    -H "Authorization: Bearer $dockerhub_jwt" \
    -H "Content-Type: application/json" \
    -d '{"is_private": true}' > /dev/null
done

docker logout
