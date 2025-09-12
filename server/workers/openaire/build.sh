#!/bin/bash
set -e

# Build the R base image (Dockerfile.r)
docker build -t r-base:latest -f Dockerfile.r ../..

# Build the main application image (modified Dockerfile) using the R base image
docker build -t headstart:latest -f Dockerfile ../..