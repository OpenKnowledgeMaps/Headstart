import os
import json
import pytest
import pandas as pd
from io import StringIO

from app import app
import apis.create_vis as vis_module

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
    # Patch redis_store methods in the vis module.
    monkeypatch.setattr(vis_module.redis_store, 'rpush', dummy_rpush)
    monkeypatch.setattr(vis_module.redis_store, 'llen', dummy_llen)
    
    # Prepare a dummy DataFrame and double-encode its JSON representation.
    dummy_df = pd.DataFrame([{"result": "value"}])
    dummy_json = dummy_df.to_json()
    dummy_result = json.dumps(dummy_json)
    
    # Patch get_key so that it always returns our dummy_result.
    monkeypatch.setattr(vis_module, 'get_key', lambda store, req_id, timeout=None: dummy_result)
    
    yield app

@pytest.fixture
def client(patched_app):
    with patched_app.test_client() as client:
        yield client

# --- Tests for the vis namespace endpoints ---

def test_create_json(client):
    payload = {
        "params": {
            "q": "test",
            "sorting": "most-recent",
            "from": "2020-01-01",
            "to": "2020-12-31",
            "vis_type": "overview",
            "limit": 10
        },
        "input_data": "dummy input"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    # Use the full URL including the /api prefix.
    response = client.post('/api/vis/create', json=payload, headers=headers)
    assert response.status_code == 200
    assert response.content_type == "application/json"
    
    dummy_df = pd.DataFrame([{"result": "value"}])
    expected_result = json.dumps(dummy_df.to_json())
    assert response.get_data(as_text=True) == expected_result

def test_create_csv(client):
    payload = {
        "params": {
            "q": "test",
            "sorting": "most-recent",
            "from": "2020-01-01",
            "to": "2020-12-31",
            "vis_type": "overview",
            "limit": 10,
            "raw": True  # Trigger CSV conversion.
        },
        "input_data": "dummy input"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "text/csv"
    }
    response = client.post('/api/vis/create', json=payload, headers=headers)
    assert response.status_code == 200
    assert response.content_type == "text/csv"
    assert "Content-Disposition" in response.headers
    
    # Verify CSV content by reading it back into a DataFrame.
    csv_data = StringIO(response.get_data(as_text=True))
    df = pd.read_csv(csv_data)
    assert "result" in df.columns

def test_queue_length(client):
    # Initially, the queue should be empty.
    response = client.get('/api/vis/queue_length')
    assert response.status_code == 200
    data = response.get_json()
    assert data == {"queue_length": 0}
    
    # Call /api/vis/create to push an item into the queue.
    payload = {
        "params": {
            "q": "test",
            "sorting": "most-recent",
            "from": "2020-01-01",
            "to": "2020-12-31",
            "vis_type": "overview",
            "limit": 10
        },
        "input_data": "dummy input"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    client.post('/api/vis/create', json=payload, headers=headers)
    
    # Now, the queue length should be 1.
    response = client.get('/api/vis/queue_length')
    data = response.get_json()
    assert data == {"queue_length": 1}

def test_service_version(client, monkeypatch):
    monkeypatch.setenv("SERVICE_VERSION", "1.2.3")
    response = client.get('/api/vis/service_version')
    assert response.status_code == 200
    data = response.get_json()
    assert data == {"service_version": "1.2.3"}