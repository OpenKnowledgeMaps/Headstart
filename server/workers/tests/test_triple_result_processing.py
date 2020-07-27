import workers
from workers.triple.src.search_triple import TripleClient
import json
import pytest
from pandas.testing import assert_frame_equal
import pandas as pd


# @pytest.fixture
# def raw_data():
#     with open("tests/testdata/raw_data.json") as infile:
#         return json.load(infile)
#
#
# @pytest.fixture
# def triple_client():
#     return TripleClient({
#                         "host": "localhost",
#                         "user": "",
#                         "pass": "",
#                         "port": 9200})
#
#
# def test_process_result_keys(triple_client, raw_data):
#     result = triple_client.process_result(raw_data)
#     assert "metadata" in result
#     assert "text" in result
#
#
# def test_process_result_dtypes(triple_client, raw_data):
#     result = triple_client.process_result(raw_data)
#     assert isinstance(json.loads(result.get('metadata')), list)
#     assert isinstance(json.loads(result.get('text')), list)
#
#
# def test_metadata_keys(triple_client, raw_data):
#     result = triple_client.process_result(raw_data)
#     metadata = json.loads(result.get('metadata'))
#     for entry in metadata:
#         for k in ["id", "title", "authors", "paper_abstract", "published_in",
#                   "year", "url", "readers", "subject", "oa_state",
#                   "link", "relevance"]:
#             assert k in entry
#
#
# def test_metadata_dtypes(triple_client, raw_data):
#     result = triple_client.process_result(raw_data)
#     metadata = json.loads(result.get('metadata'))
#     for entry in metadata:
#         for k, v in entry.items():
#             assert isinstance(k, str)
