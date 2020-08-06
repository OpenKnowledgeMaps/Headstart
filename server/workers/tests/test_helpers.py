import os
import json
import uuid
import pathlib
import redis
import pandas as pd
import pytest
from nltk.corpus import stopwords

from ..services.src.apis.utils import get_key

with open("redis_config.json") as infile:
    redis_config = json.load(infile)
redis_store = redis.StrictRedis(**redis_config)


def get_stopwords(lang):
    try:
        loc = pathlib.Path(__path__).absolute().parent.parent.parent
    except NameError:
        loc = pathlib.Path.cwd().absolute().parent.parent
    assert lang in ["english", "german"]
    resourcedir = os.path.join(loc, "server", "preprocessing", "resources")
    stops = set(stopwords.words('english'))
    with open(os.path.join(resourcedir, "%s.stop" % lang), "r") as infile:
        add_stops = set(infile.read().splitlines())
    return stops.union(add_stops)


def get_cases(folder):
    try:
        loc = pathlib.Path(__path__).parent
    except NameError:
        loc = pathlib.Path.cwd()
    testdatadir = os.path.join(loc, "tests", folder)
    casefiles = [f for f in os.listdir(testdatadir) if f.startswith("testcase")]
    casefiles.sort()
    cases = []
    for casefile in casefiles:
        with open(os.path.join(testdatadir, casefile)) as infile:
            testcase_ = json.load(infile)
        casename, _ = os.path.splitext(casefile)
        cases.append({"caseid": casename, "casedata": testcase_})
    return cases


def retrieve_results(casedata):
    k = str(uuid.uuid4())
    casedata["params"]["raw"] = True
    service = casedata["params"]["service"]
    d = {"id": k, "params": casedata["params"],
         "endpoint": "search"}
    redis_store.rpush(service, json.dumps(d))
    result = get_key(redis_store, k)
    return result


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


#@pytest.fixture

KNOWNCASES = get_cases("knowncases")
RANDOMCASES = get_cases("randomcases")
KNOWNINPUT_DATA = KNOWNCASES
RANDOMINPUT_DATA = [{"caseid": c["caseid"],
                     "casedata": {
                        "input_data": retrieve_results(c["casedata"])["input_data"],
                        "params": c["casedata"]["params"]}
                     } for c in RANDOMCASES]
CASENAMES = []
CASE_DATA = {}
for c in KNOWNINPUT_DATA + RANDOMINPUT_DATA:
    CASENAMES.append(c["caseid"])
    CASE_DATA[c["caseid"]] = c["casedata"]
CASENAMES.sort()
RESULTS = {casename: get_dataprocessing_result(casedata) for casename, casedata in CASE_DATA.items()}
