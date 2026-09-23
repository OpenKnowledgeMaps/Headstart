"""Unit tests for the DOI merge key and the DOI-group duplicates marking.

The key is the deterministic grouping backbone: coalesce the DOI-bearing
fields (doi_merge -> additional_dois -> doi), strip the doi.org URL prefix,
lowercase, unversion.

Run from the package directory:  cd server/workers/common && pytest tests
"""

import pandas as pd

from common.deduplication import (
    compute_doi_key,
    extend_duplicates_with_doi_groups,
    normalize_doi_key,
)


# --- normalize_doi_key -------------------------------------------------------

def test_prefix_strip_lowercase_unversion():
    assert normalize_doi_key("https://dx.doi.org/10.1234/ABC.v2") == "10.1234/abc"


def test_bare_and_url_forms_normalize_equal():
    assert (normalize_doi_key("10.1234/AbC")
            == normalize_doi_key("https://doi.org/10.1234/abc")
            == normalize_doi_key("https://dx.doi.org/10.1234/ABC"))


def test_version_suffix_forms_are_stripped():
    # the explicit v-forms collapse to the unversioned key, and the
    # unversioned variant itself keys identically.
    assert (normalize_doi_key("10.6084/m9.figshare.23691672.v3")
            == normalize_doi_key("10.6084/m9.figshare.23691672.v1")
            == normalize_doi_key("10.6084/m9.figshare.23691672"))
    assert normalize_doi_key("10.3886/e115525v3") == "10.3886/e115525"


def test_bare_numeric_suffix_is_not_stripped():
    # Bare .N is NOT treated as a version by the key: article-number suffixes
    # in the same style would collide distinct papers of one journal batch.
    # (Mendeley-style bare-.N versions consequently do not share a key; they
    # still merge via the title pass.)
    assert normalize_doi_key("10.1016/j.physleta.2015.07.045") == \
        "10.1016/j.physleta.2015.07.045"
    assert normalize_doi_key("10.17632/675v9chxnt.2") == "10.17632/675v9chxnt.2"
    assert normalize_doi_key("10.1594/pangaea.982329") == "10.1594/pangaea.982329"


def test_non_doi_values_yield_no_key():
    assert normalize_doi_key("https://repo.example.org/paper/42") == ""
    assert normalize_doi_key("") == ""
    assert normalize_doi_key(None) == ""


# --- compute_doi_key (coalesce) ----------------------------------------------

def test_coalesce_doi_merge_wins():
    assert compute_doi_key("10.2/b", ["10.3/c"], "10.1/a") == "10.2/b"


def test_coalesce_falls_to_additional_dois_when_doi_merge_empty():
    # the dcdoi-derived fields carry the DOI the link missed.
    assert compute_doi_key("", ["https://doi.org/10.1234/xy"], "") == "10.1234/xy"


def test_coalesce_falls_to_doi_last():
    assert compute_doi_key("", [], "https://doi.org/10.9/z") == "10.9/z"


def test_additional_dois_list_contract_first_doi_wins():
    # base.R contract: a one-element list holding a "; "-joined string.
    value = ["https://doi.org/10.1/first; https://doi.org/10.2/second"]
    assert compute_doi_key("", value, "") == "10.1/first"


def test_non_doi_candidates_are_skipped_in_coalesce():
    # A doi_merge holding a non-DOI URL must not shadow a real DOI later in
    # the coalesce order.
    assert compute_doi_key("https://repo.example.org/x", [], "10.1/a") == "10.1/a"


def test_all_empty_yields_no_key():
    assert compute_doi_key("", [], "") == ""
    assert compute_doi_key(None, None, None) == ""


# --- extend_duplicates_with_doi_groups ---------------------------------------

def _df(rows):
    return pd.DataFrame(rows)


def test_doi_partners_are_folded_into_duplicates():
    df = _df([
        {"id": "aaa", "duplicates": "aaa,", "doi_key": "10.1/x"},
        {"id": "bbb", "duplicates": "bbb,", "doi_key": "10.1/x"},
        {"id": "ccc", "duplicates": "ccc,", "doi_key": "10.2/y"},
    ])
    out = extend_duplicates_with_doi_groups(df)
    assert "bbb" in out.loc[out.id == "aaa", "duplicates"].iloc[0]
    assert "aaa" in out.loc[out.id == "bbb", "duplicates"].iloc[0]
    # Singleton key untouched.
    assert out.loc[out.id == "ccc", "duplicates"].iloc[0] == "ccc,"


def test_folded_marking_is_row_order_independent():
    rows = [
        {"id": "aaa", "duplicates": "aaa,", "doi_key": "10.1/x"},
        {"id": "bbb", "duplicates": "bbb,", "doi_key": "10.1/x"},
        {"id": "ccc", "duplicates": "ccc,", "doi_key": "10.1/x"},
    ]
    outs = []
    for order in ([0, 1, 2], [2, 0, 1]):
        df = _df([rows[i] for i in order])
        out = extend_duplicates_with_doi_groups(df)
        outs.append(dict(zip(out.id, out.duplicates)))
    assert outs[0] == outs[1]


def test_empty_keys_never_group():
    df = _df([
        {"id": "aaa", "duplicates": "aaa,", "doi_key": ""},
        {"id": "bbb", "duplicates": "bbb,", "doi_key": ""},
    ])
    out = extend_duplicates_with_doi_groups(df)
    assert out.loc[out.id == "aaa", "duplicates"].iloc[0] == "aaa,"
    assert out.loc[out.id == "bbb", "duplicates"].iloc[0] == "bbb,"
