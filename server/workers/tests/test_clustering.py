import pytest
from .test_helpers import CASES, RESULTS


@pytest.mark.parametrize("testcase_", CASES)
def test_clustering_2_items(testcase_):
    pass


@pytest.mark.parametrize("testcase_", RESULTS)
def test_max_n_cluster(testcase_):
    if len(testcase_) <= 100:
        assert testcase_.area.nunique() <= 15
