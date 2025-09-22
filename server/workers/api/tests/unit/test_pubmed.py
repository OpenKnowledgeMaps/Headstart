import os
import json
import pytest
import pandas as pd
from io import StringIO

from app import app
import apis.pubmed as pubmed_module

# --- Dummy Redis implementations ---

dummy_queue = []

def dummy_rpush(key, value):
    dummy_queue.append(value)

def dummy_llen(key):
    return len(dummy_queue)

# --- Pytest Fixtures ---

@pytest.fixture(autouse=True)
def reset_dummy_queue():
    """Reset the dummy queue before each test."""
    global dummy_queue
    dummy_queue = []
    yield
    dummy_queue = []

@pytest.fixture
def patched_app(monkeypatch):
    # Patch redis_store methods in the pubmed module.
    monkeypatch.setattr(pubmed_module.redis_store, 'rpush', dummy_rpush)
    monkeypatch.setattr(pubmed_module.redis_store, 'llen', dummy_llen)
    
    # Prepare a dummy DataFrame and create a double-encoded JSON string.
    dummy_df = pd.DataFrame([{"pubmed": "result"}])
    dummy_json = dummy_df.to_json()
    dummy_result = json.dumps(dummy_json)
    
    # Patch get_key so that it always returns our dummy_result.
    monkeypatch.setattr(pubmed_module, 'get_key', lambda store, req_id, timeout=300: dummy_result)
    
    # Patch the validator to return no errors by default.
    monkeypatch.setattr(pubmed_module.search_param_schema, 'validate', lambda params, partial: {})
    
    yield app

@pytest.fixture
def client(patched_app):
    with patched_app.test_client() as client:
        yield client

# --- Tests for the PubMed namespace endpoints ---

def test_pubmed_search_json(client):
    payload = {
        "q": "feminicide",
        "sorting": "most-recent",
        "from": "2019-01-01",
        "to": "2019-12-31",
        "vis_type": "overview",
        "limit": 50,
        "language": "en",
        "raw": False,
        "optradio": "remove me"  # this extra field should be removed by the endpoint
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    # The endpoint is registered at /api/pubmed/search.
    response = client.post("/api/pubmed/search", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.content_type == "application/json"
    
    # Expected result is our dummy_result from patched get_key.
    dummy_df = pd.DataFrame([{"pubmed": "result"}])
    expected_result = json.dumps(dummy_df.to_json())
    assert response.get_data(as_text=True) == expected_result

def test_pubmed_search_csv(client):
    payload = {
        "q": "feminicide",
        "sorting": "most-recent",
        "from": "2019-01-01",
        "to": "2019-12-31",
        "vis_type": "overview",
        "limit": 50,
        "language": "en",
        "raw": True,  # CSV conversion is triggered regardless
        "optradio": "remove me"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "text/csv"
    }
    response = client.post("/api/pubmed/search", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.content_type == "text/csv"
    assert "Content-Disposition" in response.headers

    # The dummy result (a double-encoded JSON string) is converted to CSV.
    # Reconstruct the expected CSV output:
    dummy_df = pd.DataFrame([{"pubmed": "result"}])
    # pd.read_json() called in set_response_headers reads the JSON into a DataFrame
    expected_csv = dummy_df.to_csv()  # Default to_csv() returns CSV with index.
    
    # Parse the CSV output from the response and compare DataFrames.
    csv_data = StringIO(response.get_data(as_text=True))
    result_df = pd.read_csv(csv_data, index_col=0)
    pd.testing.assert_frame_equal(result_df, dummy_df)

def test_pubmed_search_invalid(client, monkeypatch):
    # Force the validator to return an error.
    monkeypatch.setattr(pubmed_module.search_param_schema, 'validate', lambda params, partial: {"error": "Invalid parameter"})
    
    payload = {
        "q": "feminicide",
        "sorting": "most-recent",
        "from": "2019-01-01",
        "to": "2019-12-31",
        "vis_type": "overview",
        "limit": 50,
        "language": "en",
        "raw": False
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    response = client.post("/api/pubmed/search", json=payload, headers=headers)
    # A validation error should cause a 400 response.
    assert response.status_code == 400

def test_pubmed_service_version(client, monkeypatch):
    monkeypatch.setenv("SERVICE_VERSION", "7.8.9")
    response = client.get("/api/pubmed/service_version")
    assert response.status_code == 200
    data = response.get_json()
    assert data == {"service_version": "7.8.9"}