import pytest
from .test_helpers import CASES, RESULTS


@pytest.mark.parametrize("result_", CASES)
def test_clustering_2_items(result_):
    pass


@pytest.mark.parametrize("result_", RESULTS)
def test_max_n_cluster(result_):
    if len(result_) <= 100:
        assert result_.area.nunique() <= 15
