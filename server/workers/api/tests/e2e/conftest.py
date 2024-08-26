import pytest
from pytest import MonkeyPatch

from src.app import app

@pytest.fixture
def client(monkeypatch: MonkeyPatch):
    monkeypatch.setenv('SERVICE_VERSION', '1.0.0')
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client
