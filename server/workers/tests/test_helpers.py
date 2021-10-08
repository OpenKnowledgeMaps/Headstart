import os
import json
import uuid
import pathlib
import requests
import pandas as pd
from nltk.corpus import stopwords
from tqdm import tqdm

from .conftest import RANDOM

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


def retrieve_results(casedata):
    params = casedata["params"]
    url = "http://localhost/api/stable/api/%s/search" % params["service"]
    return result


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

CASENAMES, CASEDATA = data_generation(KNOWNCASES, RANDOMCASES)
CASENAMES.sort()

RESULTS = {}
print("collecting dataprocessing results")
for c in tqdm(CASEDATA):
    RESULTS[c] = get_dataprocessing_result(CASEDATA[c])
