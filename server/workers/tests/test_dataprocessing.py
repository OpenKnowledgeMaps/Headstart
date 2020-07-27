import workers
import json
import pytest
from workers.dataprocessing.src.headstart import Dataprocessing
import pandas as pd
import pandas.api.types as ptypes


# @pytest.fixture
# def map_data():
#     with open("tests/testdata/expected_output_data.json") as infile:
#         return json.load(infile).get('map_data')
#
#
# @pytest.fixture
# def input_data():
#     with open("tests/testdata/input_data.json") as infile:
#         return json.load(infile)
#
#
# @pytest.fixture
# def dataprocessing():
#     return Dataprocessing("../../../preprocessing/other-scripts")
#
#
# @pytest.fixture
# def params():
#     return {"service": "triple", "q": "femicide"}
#
#
# def test_map_data_dtypes(dataprocessing, input_data, params):
#     params = dataprocessing.add_default_params(params)
#     map_data = json.loads(dataprocessing.create_map(params, input_data))
#     assert isinstance(map_data, list)
#     df = pd.DataFrame.from_records(map_data)
#     for col in df.columns:
#         assert ptypes.is_string_dtype(df[col])
