#!/bin/bash

# Checks that config.js exists in the root of the project and creates one
# with the local dev defaults if it does not.
CONFIG_FILE="$(dirname "$0")/config.js"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "\033[1;33m  Warning: config.js not found in the project root. It will be created automatically.\033[0m"
    cat > "$CONFIG_FILE" <<'EOF'
module.exports = {
    publicPath : "http://localhost:8085/headstart/dist/",
    skin : ""
};
EOF
    echo "config.js file created."
fi
