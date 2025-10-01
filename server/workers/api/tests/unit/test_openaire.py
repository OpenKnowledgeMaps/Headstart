import os
import json
import pytest
import pandas as pd
from io import StringIO

from app import app
import apis.openaire as openaire_module

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
    # Patch redis_store methods in the openaire module.
    monkeypatch.setattr(openaire_module.redis_store, 'rpush', dummy_rpush)
    monkeypatch.setattr(openaire_module.redis_store, 'llen', dummy_llen)
    
    # Create a dummy DataFrame and generate a double-encoded JSON result.
    dummy_df = pd.DataFrame([{"result": "value"}])
    dummy_json = dummy_df.to_json()
    dummy_result = json.dumps(dummy_json)
    
    # Patch get_key so it always returns our dummy_result.
    monkeypatch.setattr(openaire_module, 'get_key', lambda store, req_id, timeout=300: dummy_result)
    
    yield app

@pytest.fixture
def client(patched_app):
    with patched_app.test_client() as client:
        yield client

# --- Tests for the OpenAIRE namespace endpoints ---

def test_search_json(client):
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
    # The endpoint is registered under /api/openaire/search.
    response = client.post('/api/openaire/search', json=payload, headers=headers)
    assert response.status_code == 200
    assert response.content_type == "application/json"
    
    # Expected result is our dummy_result computed similarly.
    dummy_df = pd.DataFrame([{"result": "value"}])
    expected_result = json.dumps(dummy_df.to_json())
    assert response.get_data(as_text=True) == expected_result

def test_search_csv(client):
    payload = {
        "q": "feminicide",
        "sorting": "most-recent",
        "from": "2019-01-01",
        "to": "2019-12-31",
        "vis_type": "overview",
        "limit": 50,
        "language": "en",
        "raw": False  # Use False so that CSV conversion is triggered in the text/csv branch.
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "text/csv"
    }
    response = client.post('/api/openaire/search', json=payload, headers=headers)
    assert response.status_code == 200
    # Expect CSV content-type and Content-Disposition header.
    assert response.content_type == "text/csv"
    assert "Content-Disposition" in response.headers
    
    # Verify CSV content by reading it into a DataFrame.
    csv_data = StringIO(response.get_data(as_text=True))
    df = pd.read_csv(csv_data)
    assert "result" in df.columns

def test_projectdata(client):
    # Test the /projectdata endpoint.
    payload = {"some": "data"}
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    response = client.post('/api/openaire/projectdata', json=payload, headers=headers)
    assert response.status_code == 200
    assert response.content_type == "application/json"
    # Expected result is our dummy_result.
    dummy_df = pd.DataFrame([{"result": "value"}])
    expected_result = json.dumps(dummy_df.to_json())
    assert response.get_data(as_text=True) == expected_result

def test_service_version(client, monkeypatch):
    # Set the SERVICE_VERSION environment variable.
    monkeypatch.setenv("SERVICE_VERSION", "3.0.0")
    response = client.get('/api/openaire/service_version')
    assert response.status_code == 200
    data = response.get_json()
    assert data == {"service_version": "3.0.0"}