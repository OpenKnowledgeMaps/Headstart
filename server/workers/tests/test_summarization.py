import pytest
from .test_helpers import CASES, RESULTS, get_stopwords

LANGS = ["english", "german"]

@pytest.mark.parametrize("testcase_", RESULTS)
def test_empty_area_titles(testcase_):
    assert testcase_.area.map(lambda x: len(x)==0).sum() == 0

@pytest.mark.parametrize("testcase_", RESULTS)
@pytest.mark.parametrize("lang_", LANGS)
def test_stopwords_not_start_end_keywords_areatitles(testcase_, lang_):
    stops = get_stopwords(lang_)
    areatitles = testcase_.area.unique()
    for at in areatitles:
        keywords = at.split(", ")
        for kw in keywords:
            tokens = kw.split(" ")
            assert tokens[0] not in stops
            assert tokens[-1] not in stops
