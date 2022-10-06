import os
import json
import time
from dateutil.parser import parse
from datetime import timedelta
import re
import redis

redis_config = {
    "host": os.getenv("REDIS_HOST"),
    "port": os.getenv("REDIS_PORT"),
    "db": os.getenv("REDIS_DB"),
    "password": os.getenv("REDIS_PASSWORD"),
    "client_name": "api"
}
redis_store = redis.StrictRedis(**redis_config)


def get_key(store, key):
    while True:
        res = store.get(key+"_output")
        if res is None:
            time.sleep(0.5)
        else:
            result = json.loads(res.decode('utf-8'))
            store.delete(key)
            store.delete(key+"_output")
            break
    return result


def detect_error(service, error, params):
    code = 500
    reason = []
    # do API specific error heuristics
    if service == "base" and error.startswith("Error in curl::curl_fetch_memory(x$url$url, handle = x$url$handle): Timeout was reached"):
        reason.append('API error: timeout')
    if service == "pubmed" and error.startswith("HTTP failure: 502, bad gateway"):
        reason.append('API error: requested metadata size')
    if service == "pubmed" and error.startswith("HTTP failure: 500"):
        reason.append('API error: PubMed not reachable')
    if not reason and service == 'pubmed' and error.startswith("HTTP failure"):
        reason.append('unexpected PubMed API error')
    # do query related error heuristics
    if not reason:
        query = params.get('q')
        phrasepattern = '"(.*?)"'
        phrases = re.findall(phrasepattern, query)
        if phrases:
            reason.append('too specific')
        elif len(query.split(" ")) < 4:
            reason.append('typo')
            reason.append('too specific')
        else:
            reason.append('query length')
            reason.append('too specific')
        if "to" in params and "from" in params:
            if parse(params.get('to')) - parse(params.get('from')) <= timedelta(days=60):
                reason.append('timeframe too short')
    # if still unknown, return default error
    if not reason:
        reason = ['unexpected data processing error']
    return code, reason
