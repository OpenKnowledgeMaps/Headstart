import os
import json

from elasticsearch import Elasticsearch


with open("config.json") as infile:
    config = json.load(infile)

es = Elasticsearch(
    ['{protocol}://{user}:{pass}@{url}:{port}'.format(**config)]
)
