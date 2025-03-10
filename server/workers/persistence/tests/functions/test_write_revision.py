import pytest
from unittest.mock import patch, MagicMock
from src.persistence import write_revision, Visualizations


@pytest.fixture
def mock_session():
    with patch('src.persistence.Session') as MockSession:
        yield MockSession


@pytest.fixture
def mock_data():
    vis_id = 'test_visualization_id'
    data = {'some_key': 'some_value'}
    return [vis_id, data]


# Tests that creation of a new revision is working correctly
def test_write_revision_new_revision(mock_session, mock_data):
    # Mocked data
    [vis_id, data] = mock_data

    # Visualization mock
    mock_vis = MagicMock(spec=Visualizations)
    mock_vis.vis_latest = None
    mock_vis.vis_clean_query = 'SELECT * FROM visualizations;'

    # Setup of the session that will be used
    mock_query = mock_session.return_value.query.return_value
    mock_query.filter_by.return_value.first.return_value = mock_vis

    # Calling function with mocked values
    write_revision(mock_session.return_value, vis_id, data)

    # Checks that new revision was created successfully
    mock_session.return_value.add.assert_called_once()
    new_rev = mock_session.return_value.add.call_args[0][0]
    assert new_rev.rev_id == 1
    assert new_rev.rev_data == data
    assert new_rev.rev_user == "System"

    # Checks that visualization id was updated
    assert mock_vis.vis_latest == 1
    mock_session.return_value.commit.assert_called_once()


# Tests that existing revision could be written
def test_write_revision_with_existing_revision(mock_session, mock_data):
    # Mocked data
    [vis_id, data] = mock_data

    # Visualization mock
    mock_vis = MagicMock(spec=Visualizations)
    mock_vis.vis_latest = 2
    mock_vis.vis_clean_query = 'SELECT * FROM visualizations;'

    # Setup of the session that will be used
    mock_query = mock_session.return_value.query.return_value
    mock_query.filter_by.return_value.first.return_value = mock_vis

    # Calling function with mocked values
    write_revision(mock_session.return_value, vis_id, data)

    # Checks that new revision was created successfully
    mock_session.return_value.add.assert_called_once()
    new_rev = mock_session.return_value.add.call_args[0][0]
    assert new_rev.rev_id == 3
    assert new_rev.rev_data == data
    assert new_rev.rev_user == "System"

    # Checks that visualization id was updated
    assert mock_vis.vis_latest == 3
    mock_session.return_value.commit.assert_called_once()


def test_write_revision_exception(mock_session, mock_data):
    # Mocked data
    [vis_id, data] = mock_data

    # Setup of the session that will cause the database exception
    mock_session.return_value.query.side_effect = Exception("Database error")

    # Calling function with mocked values
    write_revision(mock_session.return_value, vis_id, data)

    # Checks that session cancelled database changes
    mock_session.return_value.rollback.assert_called_once()
    mock_session.return_value.close.assert_called_once()