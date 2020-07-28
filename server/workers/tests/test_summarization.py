import pytest
from .test_helpers import CASES, RESULTS


@pytest.mark.parametrize("testcase_", RESULTS)
def test_empty_area_titles(testcase_):
    assert testcase_.area.map(lambda x: len(x)==0).sum() == 0
