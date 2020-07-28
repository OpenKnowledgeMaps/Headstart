import json
import pytest
import pandas as pd
from .test_helpers import CASES, RESULTS, get_dataprocessing_result


@pytest.mark.parametrize("testcase_", CASES)
def test_clustering_2_items(testcase_):
    metadata = pd.DataFrame.from_records(json.loads(testcase_["input_data"]["metadata"]))
    text = pd.DataFrame.from_records(json.loads(testcase_["input_data"]["text"]))
    metadata_sample = metadata.sample(n=2, random_state=42)
    text_sample = text.sample(n=2, random_state=42)
    testcase_["input_data"]["metadata"] = metadata_sample.to_json(orient='records')
    testcase_["input_data"]["text"] = text_sample.to_json(orient='records')
    test_result = get_dataprocessing_result(testcase_)
    assert len(test_result) == 2


@pytest.mark.parametrize("testcase_", RESULTS)
def test_max_n_cluster(testcase_):
    if len(testcase_) <= 100:
        assert testcase_.area.nunique() <= 15
