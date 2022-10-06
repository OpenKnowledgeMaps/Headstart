import json
import pytest
import pandas as pd
import numpy as np
from .test_helpers import CASENAMES, CASEDATA, RESULTS, get_dataprocessing_result


@pytest.mark.parametrize("testcase", CASENAMES)
def test_clustering_2_items(testcase):
    testcase = CASEDATA[testcase]
    metadata = pd.DataFrame.from_records(json.loads(testcase["input_data"]["metadata"]))
    text = pd.DataFrame.from_records(json.loads(testcase["input_data"]["text"]))
    metadata_sample = metadata.sample(n=2, random_state=42)
    text_sample = text.sample(n=2, random_state=42)
    testcase["input_data"]["metadata"] = metadata_sample.to_json(orient='records')
    testcase["input_data"]["text"] = text_sample.to_json(orient='records')
    test_result = get_dataprocessing_result(testcase)
    assert len(test_result) == 2


@pytest.mark.parametrize("testcase", CASENAMES)
def test_max_n_cluster(testcase):
    testcase = RESULTS[testcase]
    n_items = len(testcase)
    if n_items <= 100:
        assert testcase.area.nunique() <= 15
    if 150 <= n_items < 200:
        assert testcase.area.nunique() == 16
    if 200 <= n_items < 300:
        assert testcase.area.nunique() == 17
    if 300 <= n_items < 400:
        assert testcase.area.nunique() == 18
    if 400 <= n_items < 500:
        assert testcase.area.nunique() == 19
    if n_items >= 500:
        assert testcase.area.nunique() == 20


@pytest.mark.parametrize("testcase", CASENAMES)
def test_n_cluster_lower_bound(testcase):
    testcase = CASEDATA[testcase]
    metadata = pd.DataFrame.from_records(json.loads(testcase["input_data"]["metadata"]))
    text = pd.DataFrame.from_records(json.loads(testcase["input_data"]["text"]))
    rand_n = np.random.randint(2, 30)
    n = min(len(metadata), rand_n)
    metadata_sample = metadata.sample(n=n, random_state=42)
    text_sample = text.sample(n=n, random_state=42)
    testcase["input_data"]["metadata"] = metadata_sample.to_json(orient='records')
    testcase["input_data"]["text"] = text_sample.to_json(orient='records')
    test_result = get_dataprocessing_result(testcase)
    n_items = len(test_result)
    if n_items <= 30:
        assert test_result.area.nunique() <= round(np.sqrt(n_items)) + 1
