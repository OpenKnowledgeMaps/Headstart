import os
import json

from elasticsearch import Elasticsearch


with open("config.json") as infile:
    config = json.load(infile)

es = Elasticsearch(
    [config.get('host')],
    http_auth=(config.get('user', config.get('pass'))),
    scheme = "https",
    port = config.get('port'),
    send_get_body_as='POST',
    http_compress=True
)
