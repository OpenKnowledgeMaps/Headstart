import os
import json
import pytest
import pandas as pd
from io import StringIO

# Import the Flask app from your src/app.py.
from app import app

# Import the base module to patch its dependencies.
import apis.base as base_module

# --- Dummy implementations for external dependencies ---

dummy_queue = []

def dummy_rpush(key, value):
    dummy_queue.append(value)

def dummy_llen(key):
    return len(dummy_queue)

# --- Pytest fixtures ---

@pytest.fixture(autouse=True)
def reset_dummy_queue():
    """Reset the dummy queue before each test."""
    global dummy_queue
    dummy_queue = []
    yield
    dummy_queue = []

@pytest.fixture
def patched_app(monkeypatch):
    # Patch redis_store methods in the apis.base module.
    monkeypatch.setattr(base_module.redis_store, 'rpush', dummy_rpush)
    monkeypatch.setattr(base_module.redis_store, 'llen', dummy_llen)
    
    # Prepare a dummy DataFrame and create a double-encoded JSON string.
    dummy_df = pd.DataFrame([{"data": "value"}])
    dummy_json = dummy_df.to_json()
    dummy_result = json.dumps(dummy_json)
    
    # Patch get_key in the apis.base module to always return our dummy_result.
    monkeypatch.setattr(base_module, 'get_key', lambda store, req_id, timeout: dummy_result)
    
    # Patch the request validator to always return no errors.
    monkeypatch.setattr(base_module.search_param_schema, 'validate', lambda params, partial: {})
    
    # Configure the contentprovider_lookup as a simple dictionary.
    base_module.contentprovider_lookup.clear()
    base_module.contentprovider_lookup.update({"ftunivlausanne": "Université de Lausanne"})
    
    yield app

@pytest.fixture
def client(patched_app):
    with patched_app.test_client() as client:
        yield client

# --- Tests for the base namespace endpoints (registered under /api/base) ---

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
        "raw": True
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "text/csv"
    }
    response = client.post('/api/base/search', json=payload, headers=headers)
    assert response.status_code == 200
    assert response.content_type == "text/csv"
    assert "Content-Disposition" in response.headers

    csv_data = StringIO(response.get_data(as_text=True))
    df = pd.read_csv(csv_data)
    assert "data" in df.columns

def test_search_validation_error(client, monkeypatch):
    monkeypatch.setattr(base_module.search_param_schema, 'validate', lambda params, partial: {"error": "Invalid parameter"})
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
    assert response.status_code == 400

def test_contentproviders_empty(client):
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    # Change here: send an empty dict instead of None.
    response = client.post('/api/base/contentproviders', json={}, headers=headers)
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