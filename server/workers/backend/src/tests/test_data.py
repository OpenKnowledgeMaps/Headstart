import json
import pytest
from src.headstart import Backend
import pandas as pd
import pandas.api.types as ptypes


@pytest.fixture
def map_data():
    with open("tests/testdata/expected_output_data.json") as infile:
        return json.load(infile).get('map_data')


@pytest.fixture
def input_data():
    with open("tests/testdata/input_data.json") as infile:
        return json.load(infile)


@pytest.fixture
def backend():
    return Backend("../../../preprocessing/other-scripts")


@pytest.fixture
def params():
    return {"service": "triple", "q": "femicide"}


def test_map_data_dtypes(backend, input_data, params):
    params = backend.add_default_params(params)
    map_data = json.loads(backend.create_map(params, input_data))
    assert isinstance(map_data, list)
    df = pd.DataFrame.from_records(map_data)
    for col in df.columns:
        assert ptypes.is_string_dtype(df[col])
