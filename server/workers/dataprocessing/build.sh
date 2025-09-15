#!/bin/bash
set -e

# Build the R base image from Dockerfile.r (context set to ../..)
docker build -t r-base:latest -f Dockerfile.r ../..

# Build the main dataprocessing image using the prebuilt R base image
docker build -t headstart-dataprocessing:latest -f Dockerfile ../..