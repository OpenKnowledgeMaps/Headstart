import os
import json
import pathlib


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
