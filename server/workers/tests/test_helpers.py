import os
import json
import uuid
import pathlib
import requests
import pandas as pd
from nltk.corpus import stopwords
from tqdm import tqdm

from .conftest import RANDOM


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
    if not str(loc).endswith("tests"):
        testdatadir = os.path.join(loc, "tests", folder)
    else:
        testdatadir = os.path.join(loc, folder)
    casefiles = [f for f in os.listdir(testdatadir) if f.startswith("testcase")]
    casefiles.sort()
    cases = []
    for casefile in casefiles:
        with open(os.path.join(testdatadir, casefile)) as infile:
            testcase_ = json.load(infile)
        casename, _ = os.path.splitext(casefile)
        cases.append({"caseid": casename, "casedata": testcase_})
    return cases


def retrieve_input_data(casedata):
    params = casedata["params"]
    url = "http://localhost/api/stable/%s/search" % params["service"]
    params.pop("list_size", None)
    params["raw"] = True
    res = requests.post(url, json=params)
    return res.json()["input_data"]


def get_dataprocessing_result(casedata):
    url = "http://localhost/api/stable/vis/create"
    res = requests.post(url, json=casedata)
    return pd.DataFrame.from_records(res.json())


def data_generation(KNOWNCASES, RANDOMCASES):
    CASENAMES = []
    CASEDATA = {}
    print("collecting known test cases")
    for c in tqdm(KNOWNCASES):
        CASENAMES.append(c["caseid"])
        CASEDATA[c["caseid"]] = c["casedata"]
    print("collecting random test cases")
    for c in tqdm(RANDOMCASES):
        CASENAMES.append(c["caseid"])
        CASEDATA[c["caseid"]] = {"params": c["casedata"]["params"],
                                 "input_data": retrieve_input_data(c["casedata"])}
    return CASENAMES, CASEDATA


KNOWNCASES = get_cases("knowncases")
RANDOMCASES = get_cases("randomcases")

CASENAMES, CASEDATA = data_generation(KNOWNCASES, RANDOMCASES)
CASENAMES.sort()

RESULTS = {}
print("collecting dataprocessing results")
for c in tqdm(KNOWNCASES):
    caseid = c["caseid"]
    RESULTS[caseid] = get_dataprocessing_result(CASEDATA[caseid])
for c in tqdm(RANDOMCASES):
    caseid = c["caseid"]
    RESULTS[caseid] = get_dataprocessing_result(CASEDATA[caseid])
