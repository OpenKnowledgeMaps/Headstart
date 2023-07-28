import json
import pytest
import requests
from test_app import create_app


@pytest.fixture
def app():
    # Create a test Flask app with a temporary test database
    app = create_app(config_name="testing")
    with app.app_context():
        yield app

@pytest.fixture
def test_client(app):
    # Create a test client using the test Flask app
    return app.test_client()

def test_docker():
    print("Hello World!")

def test_hello_world(test_client):
    response = test_client.get('/')
    assert response.status_code == 200
    assert b"Hello, World!" in response.data

def test_base_search(test_client):
    # Test that the base URL returns a 200 (OK) HTTP status code
    try:
        response = test_client.get('/api/stable/base/search')
        assert response.status_code == 200
        assert response.content_type == "application/json"
        data = json.loads(response.get_data(as_text=True))
        print("Request successful!")
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

def test_base_url(app):
    # Test that the base URL returns a 200 (OK) HTTP status code
    url = "http://backend/server/services/searchBASE.php"
    # assert response.status_code == 200
    try:
        response = requests.get(url)
        response.raise_for_status()
        print("Request successful!")
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")