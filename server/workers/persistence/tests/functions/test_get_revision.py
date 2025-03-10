import pytest
from unittest.mock import patch, MagicMock
from src.persistence import get_last_version, get_revision, Visualizations, Revisions


@pytest.fixture
def mock_session():
    with patch('src.persistence.Session', autospec=True) as MockSession:
        mock_session_instance = MockSession.return_value
        yield mock_session_instance


@pytest.fixture
def mock_visualization_id():
    return 'test_vis_id'


@pytest.fixture
def mock_visualization_and_revision():
    mock_visualization = MagicMock(spec=Visualizations)
    mock_revision = MagicMock(spec=Revisions)
    return [mock_visualization, mock_revision]


# Tests getting of the last visualization
def test_get_last_version(mock_session, mock_visualization_id, mock_visualization_and_revision):
    # Getting the mock visualization id
    visualization_id = mock_visualization_id

    # Mocking visualization and revision
    [mock_visualization, mock_revision] = mock_visualization_and_revision

    # Configuring object properties for the Visualizations
    mock_visualization.vis_title = "Test Visualization Title"
    mock_visualization.vis_params = {"some_parameter": "some_value"}

    # Configuring object properties for the Revisions
    mock_revision.rev_vis = visualization_id
    mock_revision.rev_data = {"key": "value"}
    mock_revision.rev_timestamp = "2023-01-01T00:00:00Z"
    mock_revision.vis_query = "SELECT * FROM test"

    # Configuring the query
    mock_query = mock_session.query.return_value
    mock_query.select_from.return_value.filter.return_value.filter.return_value.filter.return_value.first.return_value = (mock_visualization, mock_revision)

    # Calling the testing function
    result = get_last_version(mock_session, visualization_id, details=True, context=True)

    # Checking results
    assert result["rev_vis"] == visualization_id
    assert result["vis_title"] == "Test Visualization Title"
    assert result["rev_data"] == {"key": "value"}
    assert result["rev_timestamp"] == "2023-01-01T00:00:00Z"
    assert result["vis_query"] == "SELECT * FROM test"
    assert result["vis_params"] == {"some_parameter": "some_value"}


# Tests getting of the last visualization with context
def test_get_last_version_with_context(mock_session, mock_visualization_id, mock_visualization_and_revision):
    # Getting the mock visualization id
    visualization_id = mock_visualization_id

    # Mocking visualization and revision
    [mock_visualization, mock_revision] = mock_visualization_and_revision

    # Configuring object properties for the Visualizations
    mock_visualization.vis_title = "Test Visualization Title"
    mock_visualization.vis_params = {"some_parameter": "some_value"}

    # Configuring object properties for the Revisions
    mock_revision.rev_vis = visualization_id
    mock_revision.rev_data = {"key": "value"}
    mock_revision.rev_timestamp = "2023-01-01T00:00:00Z"
    mock_revision.vis_query = "SELECT * FROM test"

    # Configuring the query
    mock_query = mock_session.query.return_value
    mock_query.select_from.return_value.filter.return_value.filter.return_value.filter.return_value.first.return_value = (mock_visualization, mock_revision)

    # Calling the testing function
    result = get_last_version(mock_session, visualization_id, details=True, context=True)

    # Checking results
    assert result["rev_vis"] == visualization_id
    assert result["vis_title"] == "Test Visualization Title"
    assert result["rev_data"] == {"key": "value"}
    assert result["rev_timestamp"] == "2023-01-01T00:00:00Z"
    assert result["vis_query"] == "SELECT * FROM test"
    assert result["vis_params"] == {"some_parameter": "some_value"}


# Tests getting of the last visualization without context (with only rev_data)
def test_get_last_version_without_context(mock_session, mock_visualization_id, mock_visualization_and_revision):
    # Getting the mock visualization id
    visualization_id = mock_visualization_id

    # Mocking visualization and revision
    [_, mock_revision] = mock_visualization_and_revision

    # Configuring object properties for the Revisions
    mock_revision.rev_data = {"key": "value"}

    # Configuring the query
    mock_query = mock_session.query.return_value
    mock_query.select_from.return_value.filter.return_value.filter.return_value.filter.return_value.first.return_value = (None, mock_revision)

    # Calling the testing function
    result = get_last_version(mock_session, visualization_id, details=False, context=False)

    # Checking results
    assert result == {"key": "value"}


# Tests that when there is no data and function returning null
def test_get_last_version_no_data(mock_session, mock_visualization_id):
    # Getting the mock visualization id
    visualization_id = mock_visualization_id

    # Configuring the query
    mock_query = mock_session.query.return_value
    mock_query.select_from.return_value.filter.return_value.filter.return_value.filter.return_value.first.return_value = None

    # Calling the testing function
    result = get_last_version(mock_session, visualization_id)

    # Checking results
    assert result == "null"


# Tests function when revision id is provided
def test_get_revision_with_explicit_rev_id(mock_session, mock_visualization_id, mock_visualization_and_revision):
    # Getting the mock visualization id
    visualization_id = mock_visualization_id
    revision_id = 42

    # Mocking visualization and revision
    [mock_visualization, mock_revision] = mock_visualization_and_revision

    # Configuring object properties for the Visualizations
    mock_visualization.vis_title = "Specific Revision"

    #  Configuring object properties for the Revisions
    mock_revision.rev_vis = visualization_id
    mock_revision.rev_id = revision_id
    mock_revision.rev_data = {"specific": "revision"}

    # Configuring the query
    mock_query = mock_session.query.return_value
    mock_query.select_from.return_value.filter.return_value.filter.return_value.filter.return_value.first.return_value = (mock_visualization, mock_revision)

    # Calling the testing function
    result = get_revision(mock_session, visualization_id, revision_id)

    # Checking results
    assert result == {"specific": "revision"}
