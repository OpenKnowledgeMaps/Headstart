import json
import pytest
from hashlib import md5
from collections import OrderedDict
from src.persistence import create_vis_id


@pytest.fixture
def mock_params():
    return {
        "q": "test_query",
        "param1": ["value1", "value2"],
        "param2": "single_value"
    }


@pytest.fixture
def param_types():
    return ["param1", "param2"]


# Tests that revision id is creating correctly
def test_create_vis_id(mock_params, param_types):
    ordered_params = OrderedDict()

    for k in param_types:
        v = mock_params[k]
        v = [str(e) for e in v] if isinstance(v, list) else str(v)
        ordered_params[k] = v
    string_to_hash = json.dumps(ordered_params, separators=(',', ':'))
    string_to_hash = " ".join([mock_params["q"].replace('"', '\\"'), string_to_hash])

    expected_result = md5(string_to_hash.encode('utf-8')).hexdigest()
    function_result = create_vis_id(mock_params, param_types)

    assert function_result == expected_result