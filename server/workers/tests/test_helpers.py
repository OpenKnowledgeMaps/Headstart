import os
import json
import uuid
import pathlib
import redis
import pandas as pd
from nltk.corpus import stopwords
from tqdm import tqdm

from .conftest import RANDOM
from ..api.src.apis.utils import get_key

# connect via nginx to APIs and submit tests

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


def data_generation(KNOWNCASES, RANDOMCASES):
    CASENAMES = []
    CASEDATA = {}
    print("collecting known test cases")
    for c in tqdm(KNOWNCASES):
        CASENAMES.append(c["caseid"])
        CASEDATA[c["caseid"]] = c["casedata"]
    if RANDOM:
        print("collecting random test cases")
        for c in tqdm(RANDOMCASES):
            CASENAMES.append(c["caseid"])
            CASEDATA[c["caseid"]] = {
                        "input_data": retrieve_results(c["casedata"])["input_data"],
                        "params": c["casedata"]["params"]}
    return CASENAMES, CASEDATA


KNOWNCASES = get_cases("knowncases")
RANDOMCASES = get_cases("randomcases")
#TRIPLE = get_cases("triple")

CASENAMES, CASEDATA = data_generation(KNOWNCASES, RANDOMCASES)
CASENAMES.sort()

RESULTS = {}
print("collecting dataprocessing results")
for c in tqdm(CASEDATA):
    RESULTS[c] = get_dataprocessing_result(CASEDATA[c])
