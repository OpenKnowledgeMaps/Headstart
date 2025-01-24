import os
import json
import pytest
import pandas as pd
from io import StringIO

# Import the Flask app from your src/app.py.
# With your pyproject.toml pythonpath settings, this import should work.
from app import app

# Import dependencies from the base namespace to patch them.
from apis.base import redis_store, get_key, search_param_schema, contentprovider_lookup

# A dummy queue to simulate Redis behavior.
dummy_queue = []

def dummy_rpush(key, value):
    dummy_queue.append(value)

def dummy_llen(key):
    return len(dummy_queue)

@pytest.fixture(autouse=True)
def reset_dummy_queue():
    """Reset the dummy queue before each test."""
    global dummy_queue
    dummy_queue = []
    yield
    dummy_queue = []

@pytest.fixture
def patched_app(monkeypatch):
    # Patch redis_store methods.
    monkeypatch.setattr(redis_store, 'rpush', dummy_rpush)
    monkeypatch.setattr(redis_store, 'llen', dummy_llen)
    
    # Prepare a dummy DataFrame and create a double-encoded JSON string.
    dummy_df = pd.DataFrame([{"data": "value"}])
    dummy_json = dummy_df.to_json()
    # The endpoint expects a double-encoded JSON (so that json.loads inside get_key works properly).
    dummy_result = json.dumps(dummy_json)
    
    # Patch get_key to always return our dummy_result.
    monkeypatch.setattr(get_key.__globals__, 'get_key', lambda store, req_id, timeout: dummy_result)
    
    # Patch the request validator to always return an empty error dict (i.e. no errors).
    monkeypatch.setattr(search_param_schema, 'validate', lambda params, partial: {})

    # Configure the contentprovider_lookup as a simple dictionary.
    contentprovider_lookup.clear()
    contentprovider_lookup.update({"ftunivlausanne": "Université de Lausanne"})
    
    yield app

@pytest.fixture
def client(patched_app):
    with patched_app.test_client() as client:
        yield client

# The base namespace endpoints are registered with the prefix '/api/base'
def test_search_json(client):
    payload = {
        "q": "feminicide",
        "sorting": "most-recent",
        "from": "2019-01-01",
        "to": "2019-12-31",
        "vis_type": "overview",
        "limit": 50
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    response = client.post('/api/base/search', json=payload, headers=headers)
    assert response.status_code == 200
    assert response.content_type == "application/json"
    
    # The dummy get_key returns a double-encoded JSON string.
    dummy_df = pd.DataFrame([{"data": "value"}])
    expected_json = json.dumps(dummy_df.to_json())
    assert response.get_data(as_text=True) == expected_json

def test_search_csv(client):
    payload = {
        "q": "feminicide",
        "sorting": "most-recent",
        "from": "2019-01-01",
        "to": "2019-12-31",
        "vis_type": "overview",
        "limit": 50,
        "raw": True  # Used to trigger CSV conversion.
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "text/csv"
    }
    response = client.post('/api/base/search', json=payload, headers=headers)
    assert response.status_code == 200
    assert response.content_type == "text/csv"
    # Ensure that the Content-Disposition header is set for CSV attachments.
    assert "Content-Disposition" in response.headers

    # Convert CSV response back into a DataFrame to verify its contents.
    csv_data = StringIO(response.get_data(as_text=True))
    df = pd.read_csv(csv_data)
    assert "data" in df.columns

def test_search_validation_error(client, monkeypatch):
    # Patch the validator to return an error.
    monkeypatch.setattr(search_param_schema, 'validate', lambda params, partial: {"error": "Invalid parameter"})
    payload = {
        "q": "feminicide",
        "sorting": "most-recent",
        "from": "2019-01-01",
        "to": "2019-12-31",
        "vis_type": "overview",
        "limit": 50
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    response = client.post('/api/base/search', json=payload, headers=headers)
    # Expect a 400 Bad Request response due to validation error.
    assert response.status_code == 400

def test_contentproviders_empty(client):
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    # When no payload is provided, the endpoint returns the full contentprovider_lookup.
    response = client.post('/api/base/contentproviders', json=None, headers=headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data == {"ftunivlausanne": "Université de Lausanne"}

def test_contentproviders_with_repo(client):
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    payload = {"repo": "ftunivlausanne"}
    response = client.post('/api/base/contentproviders', json=payload, headers=headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data == {"repo_name": "Université de Lausanne"}