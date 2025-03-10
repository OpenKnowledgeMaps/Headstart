import json
import pytest
from unittest.mock import patch, MagicMock
from src.persistence import get_context, Visualizations, Revisions


@pytest.fixture
def mock_session():
    with patch('src.persistence.Session', autospec=True) as MockSession:
        yield MockSession.return_value


@pytest.fixture
def mock_visualization_id():
    return 'test_vis_id'


@pytest.fixture
def mock_visualization_and_revision():
    mock_visualization = MagicMock(spec=Visualizations)
    mock_revision = MagicMock(spec=Revisions)
    return [mock_visualization, mock_revision]


# Tests that function works correctly without additional_context
def test_get_context_basic(mock_session, mock_visualization_id, mock_visualization_and_revision):
    # Getting the mock visualization id
    visualization_id = mock_visualization_id

    # Mocking visualization and revision
    [mock_visualization, mock_revision] = mock_visualization_and_revision

    # Configuring object properties for the visualization
    mock_visualization.vis_title = "Test Visualization"
    mock_visualization.vis_params = {"param1": "value1"}

    # Configuring object properties for the revision
    mock_revision.rev_vis = visualization_id
    mock_revision.rev_data = json.dumps({"key": "value"})
    mock_revision.rev_timestamp = "2023-01-01T00:00:00Z"
    mock_revision.vis_query = "SELECT * FROM test"

    # Configuring the query
    mock_query = mock_session.query.return_value
    mock_query.select_from.return_value.filter.return_value.filter.return_value.filter.return_value.first.return_value = (mock_visualization, mock_revision)

    # Calling the testing function
    result = get_context(mock_session, visualization_id, revision_context=False)

    # Checking results
    assert result["rev_vis"] == visualization_id
    assert result["vis_query"] == "SELECT * FROM test"
    assert result["vis_title"] == "Test Visualization"
    assert result["rev_timestamp"] == "2023-01-01T00:00:00Z"
    assert result["vis_params"] == {"param1": "value1"}
    assert "additional_context" not in result


# Tests how function works with additional_context
def test_get_context_with_revision_context(mock_session,mock_visualization_id, mock_visualization_and_revision):
    # Getting the mock visualization id
    visualization_id = mock_visualization_id

    # Mocking visualization and revision
    [mock_visualization, mock_revision] = mock_visualization_and_revision

    # Configuring object properties for the visualization
    mock_visualization.vis_title = "Test Visualization"
    mock_visualization.vis_params = {"param1": "value1"}

    # Configuring object properties for the revision
    mock_revision.rev_vis = visualization_id
    mock_revision.rev_data = json.dumps({"additional_context": {"extra": "info"}})
    mock_revision.rev_timestamp = "2023-01-01T00:00:00Z"
    mock_revision.vis_query = "SELECT * FROM test"

    # Configuring the query
    mock_query = mock_session.query.return_value
    mock_query.select_from.return_value.filter.return_value.filter.return_value.filter.return_value.first.return_value = (mock_visualization, mock_revision)

    # Calling the testing function
    result = get_context(mock_session, visualization_id, revision_context='true')

    # Checking results
    assert "additional_context" in result
    assert result["additional_context"] == {"extra": "info"}


# Tests that returns False if there is no data
def test_get_context_no_data(mock_session, mock_visualization_id):
    # Getting the mock visualization id
    visualization_id = mock_visualization_id

    # Configuring the query
    mock_query = mock_session.query.return_value
    mock_query.select_from.return_value.filter.return_value.filter.return_value.filter.return_value.first.return_value = None

    # Calling the testing function
    result = get_context(mock_session, visualization_id)

    # Checking results
    assert result == [False]
