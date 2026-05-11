#!/bin/bash

# Defines the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
REPO_ROOT="$SCRIPT_DIR/../.."
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
if ! git -C "$REPO_ROOT" diff --quiet -- "$CONTENTPROVIDERS_FILE"; then
  echo "contentproviders.json changed, committing..."
  git -C "$REPO_ROOT" add -- "$CONTENTPROVIDERS_FILE"
  git -C "$REPO_ROOT" commit -m "update of contentprovider.json cache"
fi
