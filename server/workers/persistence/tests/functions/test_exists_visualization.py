import pytest
from unittest.mock import patch, MagicMock
from src.persistence import exists_visualization, Visualizations


@pytest.fixture
def mock_session():
    with patch('src.persistence.Session') as MockSession:
        yield MockSession


# Tests that visualization is not found in the database
def test_exists_visualization_not_found(mock_session):
    mock_query = mock_session.return_value.query.return_value
    mock_query.filter_by.return_value.first.return_value = None

    function_result = exists_visualization(None, 'test_visualization_id')

    assert function_result is False
    mock_session.return_value.query.assert_called_once_with(Visualizations)
    mock_query.filter_by.assert_called_once_with(vis_id='test_visualization_id')


# Tests that visualization is found in the database
def test_exists_visualization_found(mock_session):
    mock_vis = MagicMock(spec=Visualizations)
    mock_query = mock_session.return_value.query.return_value
    mock_query.filter_by.return_value.first.return_value = mock_vis

    function_result = exists_visualization(None, 'test_visualization_id')

    assert function_result is True
    mock_session.return_value.query.assert_called_once_with(Visualizations)
    mock_query.filter_by.assert_called_once_with(vis_id='test_visualization_id')


# Tests that visualization is throwing the exception if it faces problems with database
def test_exists_visualization_exception(mock_session):
    mock_session.return_value.query.side_effect = Exception("Database error")

    function_result = exists_visualization(None, 'test_visualization_id')

    assert function_result is False