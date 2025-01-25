import os
import json
import pytest
import pandas as pd
from io import StringIO

from app import app
import apis.create_vis as vis_module

# --- Dummy Redis implementations ---

# A dummy queue to simulate the Redis list for the key "input_data"
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
    # Patch the redis_store methods in the vis module
    monkeypatch.setattr(vis_module.redis_store, 'rpush', dummy_rpush)
    monkeypatch.setattr(vis_module.redis_store, 'llen', dummy_llen)
    
    # Create a dummy DataFrame to simulate the get_key result.
    # We double-encode the JSON so that, when get_key is called,
    # json.loads(dummy_result) returns the inner JSON string.
    dummy_df = pd.DataFrame([{"result": "value"}])
    dummy_json = dummy_df.to_json()
    dummy_result = json.dumps(dummy_json)
    
    # Patch get_key in the vis module so that it always returns dummy_result.
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
    response = client.post('/vis/create', json=payload, headers=headers)
    # Expect a 200 OK response with JSON content.
    assert response.status_code == 200
    assert response.content_type == "application/json"
    
    # The patched get_key returns a double-encoded JSON string.
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
            "raw": True
        },
        "input_data": "dummy input"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "text/csv"
    }
    response = client.post('/vis/create', json=payload, headers=headers)
    assert response.status_code == 200
    # Check that the response is CSV and has the proper header.
    assert response.content_type == "text/csv"
    assert "Content-Disposition" in response.headers
    
    # Convert CSV response back into a DataFrame to verify its content.
    csv_data = StringIO(response.get_data(as_text=True))
    df = pd.read_csv(csv_data)
    # We expect the dummy DataFrame to have the "result" column.
    assert "result" in df.columns

def test_queue_length(client):
    # Initially, the dummy queue should be empty.
    response = client.get('/vis/queue_length')
    assert response.status_code == 200
    data = response.get_json()
    assert data == {"queue_length": 0}
    
    # Call /vis/create to push an item into the queue.
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
    client.post('/vis/create', json=payload, headers=headers)
    
    # Now, the queue length should be 1.
    response = client.get('/vis/queue_length')
    data = response.get_json()
    assert data == {"queue_length": 1}

def test_service_version(client, monkeypatch):
    # Set the environment variable for SERVICE_VERSION.
    monkeypatch.setenv("SERVICE_VERSION", "1.2.3")
    response = client.get('/vis/service_version')
    assert response.status_code == 200
    data = response.get_json()
    assert data == {"service_version": "1.2.3"}