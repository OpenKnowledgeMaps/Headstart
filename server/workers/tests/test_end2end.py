import json
import pytest
import requests
from workers.tests.mock_app import create_app
from sqlalchemy import create_engine
from workers.persistence.src.models import Base

@pytest.fixture
def app():
    # Create a test Flask app with a temporary test database
    # It will setup the Visualizations and Revisions tables
    # each time the test runs and drop them when the test is done
    app = create_app(config_name="testing")
    engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    with app.app_context():
        Base.metadata.reflect(engine)
        yield app
        Base.metadata.clear()

@pytest.fixture
def test_client(app):
    # Create a test client using the test Flask app
    return app.test_client()

def test_hello_world(test_client):
    response = test_client.get('/hello')
    assert response.status_code == 200
    assert b"Hello, World!" in response.data

def test_search_api_reachability(test_client):
    # Test that the base URL returns a 200 (OK) HTTP status code
    try:
        response = test_client.get('/api/stable/base/search')
        assert response.status_code == 200
        assert response.content_type == "application/json"
        data = json.loads(response.get_data(as_text=True))
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

def test_search_endpoint():
    url = "http://backend/server/services/searchBASE.php"
    params = {
        "unique_id": "530133cf1768e6606f63c641a1a96768",
        "from": "1809-01-01",
        "to": "2023-07-28",
        "document_types": ["121"],
        "q": "digital education",
        "sorting": "most-recent"
    }
    try:
        response = requests.post(url, data=params)
        response.raise_for_status()
        data = response.json()
        assert "query" in data
        assert "id" in data
        assert "status" in data
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        print(response.json())

def test_getLatestRevision():
    url = "http://backend/server/services/getLatestRevision.php"
    params = {
        "vis_id": "530133cf1768e6606f63c641a1a96768",
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        assert type(data) == list
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        print(response.content)


def test_getLatestRevisionWithContext():
    url = "http://backend/server/services/getLatestRevision.php"
    params = {
        "vis_id": "530133cf1768e6606f63c641a1a96768",
        "context": True
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        print(data.keys())
        print(type(data["context"]))
        print(type(data["data"]))
        assert type(data) == dict
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        print(response.content)

def test_getLatestRevisionWithDetails():
    url = "http://backend/server/services/getLatestRevision.php"
    params = {
        "vis_id": "530133cf1768e6606f63c641a1a96768",
        "context": True,
        "details": True
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        print(data.keys())
        print(type(data["context"]))
        print(type(data["data"]))
        assert type(data) == dict
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        print(response.content)

def test_persistence_api(test_client):
    url = "/api/stable/persistence/service_version"
    try:
        response = test_client.get(url)
        assert response.status_code == 200
        assert b"test_version" in response.data
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        print(response.content)
    
def test_list_databases(test_client, app):
    url = "/list_databases"
    try:
        response = test_client.get(url)
        assert response.status_code == 200
        assert b'["postgres","testuser","testdb"]\n' in response.data
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        print(response.content)
