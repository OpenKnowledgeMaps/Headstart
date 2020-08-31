import json
import pytest
import pandas as pd
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
    if len(testcase) <= 100:
        assert testcase.area.nunique() <= 15
