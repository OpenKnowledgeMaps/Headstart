import os
import json
import uuid
import pathlib
import redis
import pandas as pd

from ..services.src.apis.utils import get_key

with open("redis_config.json") as infile:
    redis_config = json.load(infile)
redis_store = redis.StrictRedis(**redis_config)


def get_cases():
    testdatadir = os.path.join(pathlib.Path(__file__).parent, "testdata")
    casefiles = [f for f in os.listdir(testdatadir) if f.endswith(".json")]
    casefiles.sort()
    cases = []
    for casefile in casefiles:
        with open(os.path.join(testdatadir, casefile)) as infile:
            testcase_ = json.load(infile)
        cases.append(testcase_)
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


CASES = get_cases()
RESULTS = [get_dataprocessing_result(c) for c in CASES]
