from flask.testing import FlaskClient

def test_base(client: FlaskClient):
    response = client.get('/api/base/service_version')
    data = response.data
    print(data)
    assert response.status_code == 200
    assert response.headers['Content-Type'] == 'application/json'
    assert response.json == {"service_version": "1.0.0"}

