import pytest
from .test_helpers import CASENAMES, RESULTS, get_stopwords

LANGS = ["english", "german"]


@pytest.mark.parametrize("testcase", CASENAMES)
def test_empty_area_titles(testcase):
    testcase = RESULTS[testcase]
    assert testcase.area.map(lambda x: len(x)==0).sum() == 0


@pytest.mark.parametrize("testcase", CASENAMES)
@pytest.mark.parametrize("lang", LANGS)
def test_stopwords_not_start_end_keywords_areatitles(testcase, lang):
    testcase = RESULTS[testcase]
    stops = get_stopwords(lang)
    areatitles = testcase.area.unique()
    for at in areatitles:
        keywords = at.split(", ")
        for kw in keywords:
            tokens = kw.split(" ")
            assert tokens[0] not in stops
            assert tokens[-1] not in stops
