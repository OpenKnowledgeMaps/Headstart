import os
import json
import pytest
from app import app

# You can reuse the 'client' fixture if defined in your conftest.py.
# Otherwise, you can define it here:
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_export_bibtex(client):
    # Create a valid metadata payload for BibTeX export.
    metadata = {
        "title": "Test Title",
        "authors_objects": [{"firstName": "John", "lastName": "Doe"}],
        "doi": "https://doi.org/10.1234/test",
        "id": "1234",
        "published_in": "Journal of Testing",
        "list_link": {"address": "http://example.com"},
        "resulttype": ["Journal/newspaper article"],
        "year": "2020-05-01"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    response = client.post("/api/export/bibtex", json=metadata, headers=headers)
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
    
    data = response.get_json()
    # Check that the response indicates a BibTeX export.
    assert data["format"] == "bibtex"
    
    # The exported BibTeX string should include key pieces of data.
    export_text = data["export"]
    assert "Test Title" in export_text, "Export text should include the title"
    assert "Doe, John" in export_text, "Export text should include the formatted author"
    # Depending on the mapping, the journal field should be set.
    assert ("Journal" in export_text or "journal" in export_text), "Export text should include journal information"

def test_export_unknown_format(client):
    # Sending an unsupported format should result in an error.
    metadata = {"title": "Test Title"}
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    response = client.post("/api/export/unknown", json=metadata, headers=headers)
    assert response.status_code == 400, f"Expected 400 but got {response.status_code}"
    data = response.get_json()
    assert data.get("status") == "error", "Response should indicate an error status"

def test_export_service_version(client, monkeypatch):
    # Set the SERVICE_VERSION env var and verify the endpoint returns it.
    monkeypatch.setenv("SERVICE_VERSION", "2.0.0")
    response = client.get("/api/export/service_version")
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
    data = response.get_json()
    assert data == {"service_version": "2.0.0"}

def test_export_healthcheck(client):
    # Verify the healthcheck endpoint.
    response = client.get("/api/export/healthcheck")
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
    data = response.get_json()
    assert data == {"status": "I'm good"}