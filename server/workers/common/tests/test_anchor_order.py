"""Unit tests for the deterministic anchor total order and the enrichment
tie-breaks.

Anchor selection and every enrichment fold must be a function of record
content, never of input row order: BASE response order is not stable between
runs. These tests pin each tie-break rung and each fold in isolation; the
end-to-end order-invariance tests live in the base worker's suite.

Run from the package directory:  cd server/workers/common && pytest tests
"""

import pandas as pd

from common.deduplication import (
    deduplicate_keywords,
    deduplicate_links,
    select_anchor_index,
)
from common.enrichment import (
    process_additional_dois_element,
    process_oa_state_element,
    process_paper_abstract_element,
)


def _df(rows):
    return pd.DataFrame(rows)


# --- select_anchor_index -----------------------------------------------------

def test_primary_keys_decide_before_tie_break():
    df = _df([
        {"id": "older", "title": "Same title", "year": "2018"},
        {"id": "newer", "title": "Same title", "year": "2022"},
    ])
    idx = select_anchor_index(df, ["year"], [False])
    assert df.loc[idx, "id"] == "newer"


def test_shorter_title_wins_across_different_beginnings():
    # Rule 1: different beginnings -> shorter title preferred (regardless of
    # alphabetical order; "Zebra…" is shorter but sorts after "Antelope…").
    df = _df([
        {"id": "z", "title": "Zebra stripes", "year": "2020"},
        {"id": "a", "title": "Antelope horns", "year": "2020"},
    ])
    for order in (df, df.iloc[::-1]):
        idx = select_anchor_index(order, ["year"], [False])
        assert order.loc[idx, "id"] == "z"


def test_journal_prefix_variant_loses_to_bare_title():
    # Rule 1 target case: the journal-name-prefixed variant is longer with a
    # different beginning -> the bare title wins.
    df = _df([
        {"id": "prefixed", "year": "2020",
         "title": "Frontiers in Earth Science / Microplastic emission and socioeconomic data of families"},
        {"id": "bare", "year": "2020",
         "title": "Microplastic emission and socioeconomic data of families"},
    ])
    for order in (df, df.iloc[::-1]):
        idx = select_anchor_index(order, ["year"], [False])
        assert order.loc[idx, "id"] == "bare"


def test_truncated_title_loses_to_full_title():
    # Rule 2 target case: identical lexicographic beginning -> the longer
    # (untruncated / subtitled) variant wins.
    df = _df([
        {"id": "truncated", "year": "2020",
         "title": "Greenwashing in the US metal industry? A novel approach combining SO"},
        {"id": "full", "year": "2020",
         "title": "Greenwashing in the US metal industry? A novel approach combining SO2 "
                  "concentrations from satellite data, a plant-level firm database"},
    ])
    for order in (df, df.iloc[::-1]):
        idx = select_anchor_index(order, ["year"], [False])
        assert order.loc[idx, "id"] == "full"


def test_title_comparison_is_normalized():
    # Case-only title variants normalize equal; the id must then decide.
    df = _df([
        {"id": "b-rec", "title": "SAME TITLE", "year": "2020"},
        {"id": "a-rec", "title": "Same Title", "year": "2020"},
    ])
    for order in (df, df.iloc[::-1]):
        idx = select_anchor_index(order, ["year"], [False])
        assert order.loc[idx, "id"] == "a-rec"


def test_nan_sorts_last_in_primary_key():
    # Matches the previous head(1) semantics: a present version beats None.
    df = _df([
        {"id": "unversioned", "title": "T", "doi_version": None},
        {"id": "v1", "title": "T", "doi_version": 1.0},
    ])
    for order in (df, df.iloc[::-1]):
        idx = select_anchor_index(order, ["doi_version"], [False])
        assert order.loc[idx, "id"] == "v1"


def test_no_keys_at_all_still_deterministic():
    # No primary keys, no title/id columns: degrades to first row (callers
    # always have id, this is the guard for exotic frames).
    df = _df([{"x": 1}, {"x": 2}])
    assert select_anchor_index(df) == df.index[0]


# --- deduplicate_keywords: insertion-order invariance ------------------------

def test_similar_equal_length_keywords_survivor_is_order_independent():
    # Case variants compare equal after lowering and have equal length, so
    # neither replaces the other: the survivor is whichever came first,
    # which the sorted iteration makes order-independent.
    a, b = "Modelling", "modelling"
    kept_ab = deduplicate_keywords([a, b], 85)
    kept_ba = deduplicate_keywords([b, a], 85)
    assert kept_ab == kept_ba
    assert len(kept_ab) == 1


def test_longer_variant_still_wins():
    kept = deduplicate_keywords(["color", "colour"], 85)
    assert kept == ["colour"]


# --- deduplicate_links: collision survivor is order-independent --------------

def test_same_protocol_display_variant_is_order_independent():
    a, b = "https://repo.example.org/a", "HTTPS://repo.example.org/a"
    kept_ab = deduplicate_links([a, b])
    kept_ba = deduplicate_links([b, a])
    assert kept_ab == kept_ba
    assert len(kept_ab) == 1


def test_https_still_preferred_over_http():
    kept = deduplicate_links(["http://x.org/a", "https://x.org/a"])
    assert kept == ["https://x.org/a"]


# --- enrichment accumulator ties ---------------------------------------------

def test_equal_length_abstract_tie_is_order_independent():
    a, b = "Equal length abstract A", "Equal length abstract B"
    results = []
    for pair in ((a, b), (b, a)):
        acc = {"best_value": None, "best_length": 0}
        for v in pair:
            process_paper_abstract_element(v, acc)
        results.append(acc["best_value"])
    assert results[0] == results[1] == a


def test_longer_abstract_still_wins():
    acc = {"best_value": None, "best_length": 0}
    for v in ("short", "a longer abstract"):
        process_paper_abstract_element(v, acc)
    assert acc["best_value"] == "a longer abstract"


def test_oa_state_representation_tie_is_order_independent():
    # "1" and 1.0 share a priority; the kept representation must not depend
    # on member iteration order.
    results = []
    for pair in (("1", 1.0), (1.0, "1")):
        acc = {"best_value": None, "best_priority": float("inf")}
        for v in pair:
            process_oa_state_element(v, acc)
        results.append(acc["best_value"])
    assert str(results[0]) == str(results[1]) == "1"


def test_additional_dois_case_variant_is_order_independent():
    variants = ("10.1234/ABC", "10.1234/abc")
    results = []
    for pair in (variants, variants[::-1]):
        acc = {}
        for v in pair:
            process_additional_dois_element(v, "", acc)
        results.append(acc)
    assert results[0] == results[1] == {"10.1234/abc": "10.1234/ABC"}
