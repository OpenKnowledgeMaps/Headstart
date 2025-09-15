import os
import json
import pytest
from app import app
import apis.orcid as orcid_module

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
    # Patch redis_store methods in the ORCiD module.
    monkeypatch.setattr(orcid_module.redis_store, 'rpush', dummy_rpush)
    monkeypatch.setattr(orcid_module.redis_store, 'llen', dummy_llen)
    
    # Create a dummy result to return from get_key.
    dummy_result = json.dumps({"dummy": "orcid result"})
    
    # Patch get_key so that it always returns our dummy_result.
    monkeypatch.setattr(orcid_module, 'get_key', lambda store, req_id, timeout=600: dummy_result)
    
    yield app

@pytest.fixture
def client(patched_app):
    with patched_app.test_client() as client:
        yield client

# --- Tests for the ORCiD namespace endpoints ---

def test_orcid_search_json(client):
    # Payload with required fields. Extra "optradio" should be removed.
    payload = {
        "q": "test query",
        "orcid": "1234-5678-9012-3456",
        "optradio": "should be removed"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    # The endpoint is registered under /api/orcid/search.
    response = client.post("/api/orcid/search", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.content_type == "application/json"
    
    # Expected result is our dummy result.
    expected_result = json.dumps({"dummy": "orcid result"})
    assert response.get_data(as_text=True) == expected_result

def test_orcid_service_version(client, monkeypatch):
    # Set a test value for SERVICE_VERSION.
    monkeypatch.setenv("SERVICE_VERSION", "4.5.6")
    response = client.get("/api/orcid/service_version")
    assert response.status_code == 200
    data = response.get_json()
    assert data == {"service_version": "4.5.6"}