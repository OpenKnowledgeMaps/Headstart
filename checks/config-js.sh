#!/bin/bash

# Checks that config.js file exists in the root of the project
CONFIG_FILE="$(dirname "$0")/config.js"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "\033[1;33m  Warning: config.js not found in the project root! See the config.example.js file.\033[0m"
fi