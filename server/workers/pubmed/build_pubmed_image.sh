#!/bin/bash
# Build the PubMed application image from Dockerfile.pubmed
docker build -f Dockerfile.pubmed -t my-pubmed-app .