import pytest
from unittest.mock import patch
from src.persistence import create_visualization, Visualizations, Revisions


@pytest.fixture
def mock_session():
    with patch('src.persistence.Session') as MockSession:
        yield MockSession


@pytest.fixture
def mock_data():
    visualization_id = 'test_visualization_id'
    visualization_title = 'Test Visualization Title'
    data = {'some_key': 'some_value'}
    return [visualization_id, visualization_title, data]


# Tests that new visualization creating without problems
def test_create_visualization_new(mock_session, mock_data):
    # Getting mocked data
    [visualization_id, visualization_title, data] = mock_data

    # Mocking of the exists_visualization function
    with patch('src.persistence.exists_visualization', return_value=False):
        # Calling the create_visualization function
        create_visualization(mock_session.return_value, visualization_id, visualization_title, data)

        # Checks that add was called two times
        assert mock_session.return_value.add.call_count == 2

        # Checks that the first call was with the Visualization object
        added_visualization = mock_session.return_value.add.call_args_list[0][0][0]

        assert isinstance(added_visualization, Visualizations)
        assert added_visualization.vis_id == visualization_id
        assert added_visualization.vis_title == visualization_title

        # Checks that the second call was with the Visualization object
        added_revision = mock_session.return_value.add.call_args_list[1][0][0]
        assert isinstance(added_revision, Revisions)

        # Checks that commit was called
        mock_session.return_value.commit.assert_called()


# Tests case when visualization already exists
def test_create_visualization_exists(mock_session, mock_data):
    # Getting mocked data
    [visualization_id, visualization_title, data] = mock_data

    # Mocking the exists_visualization function
    with patch('src.persistence.exists_visualization', return_value=True):
        create_visualization(mock_session.return_value, visualization_id, visualization_title, data)

        # Checks that adding was not called
        mock_session.return_value.add.assert_not_called()
        mock_session.return_value.commit.assert_not_called()


# Tests that function throwing the database exception when data is wrong
def test_create_visualization_exception(mock_session, mock_data):
    # Getting mocked data
    [visualization_id, visualization_title, data] = mock_data

    # Mocking the exists_visualization function
    with patch('src.persistence.exists_visualization', return_value=False):
        # Set up session to throw the exception
        mock_session.return_value.add.side_effect = Exception("Database error")

        create_visualization(mock_session.return_value, visualization_id, visualization_title, data)

        # Checks that session cancelled changes
        mock_session.return_value.rollback.assert_called_once()
        mock_session.return_value.close.assert_called_once()