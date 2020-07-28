import os
import json
import uuid
import pathlib
import redis
import pandas as pd

from ..services.src.apis.utils import get_key

import nltk
from nltk.corpus import stopwords

with open("redis_config.json") as infile:
    redis_config = json.load(infile)
redis_store = redis.StrictRedis(**redis_config)


def get_stopwords(lang):
    assert lang in ["english", "german"]
    resourcedir = os.path.join(pathlib.Path(__file__).parent.parent.parent, "preprocessing", "resources")
    stops = set(stopwords.words('english'))
    with open(os.path.join(resourcedir, "%s.stop" % lang), "r") as infile:
        add_stops = set(infile.read().splitlines())
    return stops.union(add_stops)

def get_cases():
    testdatadir = os.path.join(pathlib.Path(__file__).parent, "testdata")
    casefiles = [f for f in os.listdir(testdatadir) if f.startswith("testcase")]
    casefiles.sort()
    cases = {}
    for casefile in casefiles:
        with open(os.path.join(testdatadir, casefile)) as infile:
            testcase_ = json.load(infile)
        casename, _ = os.path.splitext(casefile)
        cases[casename] = testcase_
    return cases


def get_dataprocessing_result(testcase_):
    k = str(uuid.uuid4())
    params = testcase_["params"]
    input_data = testcase_["input_data"]
    res = {}
    res["id"] = k
    res["params"] = params
    res["input_data"] = input_data
    redis_store.rpush("input_data", json.dumps(res).encode('utf8'))
    result = get_key(redis_store, k)
    return pd.DataFrame.from_records(json.loads(result))


def retrieve_results(testcase_):
    k = str(uuid.uuid4())
    service = testcase_["params"]["service"]
    d = {"id": k, "params": testcase_["params"],
         "endpoint": "search"}
    redis_store.rpush(service, json.dumps(d))
    result = get_key(redis_store, k)
    return result

CASES = get_cases()
CASENAMES = list(CASES.keys())
# INPUT_DATA = [retrieve_results(c) for c in CASES]
INPUT_DATA = CASES
RESULTS = {casename:get_dataprocessing_result(casedata) for casename, casedata in INPUT_DATA.items()}
