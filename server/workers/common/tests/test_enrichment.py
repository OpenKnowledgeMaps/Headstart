"""Integration tests for PDF link enrichment in common.enrichment.

These run the full `enrich_anchor_using_duplicates` function on small,
hand-built DataFrames and assert on the `pdf_link_candidates_from_duplicates`
column. They cover:

  * happy path: duplicates contribute new candidates
  * https is preferred over http during dedup
  * the anchor's own link is filtered out
  * empty / single-element groups don't write a candidates value
  * multiple candidates are joined and sorted

Run from the package directory:

    cd server/workers/common && pytest tests/test_enrichment.py
"""

import pandas as pd
import pytest

from common.enrichment import enrich_anchor_using_duplicates


def _make_df(rows):
    """Build a DataFrame with the columns enrichment expects.

    `rows` is a list of dicts. Any missing column defaults to '' so the test
    can stay focused on the link logic.
    """
    columns = ["id", "is_anchor", "link", "subject_orig", "subject",
               "paper_abstract", "oa_state", "doi", "title",
               "keywords_rank_mesh_specific", "keywords_rank_mesh_generic",
               "pdf_link_candidates_from_duplicates"]
    defaults = {c: "" for c in columns}
    defaults["is_anchor"] = False
    full_rows = [{**defaults, **r} for r in rows]
    df = pd.DataFrame(full_rows)
    # Match the indexing the base worker uses: string ids as the index.
    df.index = df["id"]
    return df


def _groups_for(df):
    """All rows go into a single duplicate group keyed by their first id."""
    return pd.Series({df["id"].iloc[0]: df.index.tolist()})


def test_anchor_gains_candidates_from_duplicate_links():
    df = _make_df([
        {"id": "a", "is_anchor": True,  "link": "https://doi.org/10.1/anchor"},
        {"id": "b", "is_anchor": False, "link": "https://repo.example.org/paper/42"},
        {"id": "c", "is_anchor": False, "link": "https://pubmed.ncbi.nlm.nih.gov/12345"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    candidates = result.loc["a", "pdf_link_candidates_from_duplicates"]

    assert candidates  # non-empty
    parts = [p.strip() for p in candidates.split(";")]
    assert "https://repo.example.org/paper/42" in parts
    assert "https://pubmed.ncbi.nlm.nih.gov/12345" in parts
    # Anchor's own link is excluded.
    assert "https://doi.org/10.1/anchor" not in parts


def test_anchor_gains_mesh_from_duplicate():
    # Regression: the anchor absorbs subject_orig from duplicates (incl. [MeSH]) but
    # historically kept its own (empty) MeSH columns -> [MeSH]-marked subject_orig with
    # empty MeSH columns, so ranking Modes 2/3 degraded to Mode 1. The MeSH columns must
    # merge like subject_orig.
    df = _make_df([
        {"id": "a", "is_anchor": True,  "subject_orig": "Economics",
         "keywords_rank_mesh_specific": "", "keywords_rank_mesh_generic": ""},
        {"id": "b", "is_anchor": False, "subject_orig": "Cooperative Behavior [MeSH]; Humans [MeSH]",
         "keywords_rank_mesh_specific": "Cooperative Behavior", "keywords_rank_mesh_generic": "Humans"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))

    assert "Cooperative Behavior" in result.loc["a", "keywords_rank_mesh_specific"]
    assert "Humans" in result.loc["a", "keywords_rank_mesh_generic"]
    # ...and stays consistent with the subject_orig the anchor absorbed.
    assert "Cooperative Behavior [MeSH]" in result.loc["a", "subject_orig"]


def test_https_preferred_over_http_in_candidates():
    df = _make_df([
        {"id": "a", "is_anchor": True,  "link": "https://doi.org/10.1/anchor"},
        {"id": "b", "is_anchor": False, "link": "http://repo.example.org/paper/42"},
        {"id": "c", "is_anchor": False, "link": "https://repo.example.org/paper/42"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    candidates = result.loc["a", "pdf_link_candidates_from_duplicates"]
    parts = [p.strip() for p in candidates.split(";")]

    assert "https://repo.example.org/paper/42" in parts
    assert "http://repo.example.org/paper/42" not in parts


def test_candidates_are_sorted_and_semicolon_joined():
    df = _make_df([
        {"id": "a", "is_anchor": True,  "link": "https://doi.org/10.1/anchor"},
        {"id": "b", "is_anchor": False, "link": "https://z.example.org/x"},
        {"id": "c", "is_anchor": False, "link": "https://a.example.org/x"},
        {"id": "d", "is_anchor": False, "link": "https://m.example.org/x"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    candidates = result.loc["a", "pdf_link_candidates_from_duplicates"]
    parts = [p.strip() for p in candidates.split(";")]

    assert parts == sorted(parts)
    # Exactly the 3 duplicate URLs, anchor link excluded.
    assert len(parts) == 3


def test_semicolon_separated_link_field_is_split_per_url():
    df = _make_df([
        {"id": "a", "is_anchor": True,  "link": "https://doi.org/10.1/anchor"},
        {"id": "b", "is_anchor": False,
         "link": "https://repo.example.org/a; https://pubmed.ncbi.nlm.nih.gov/9"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    candidates = result.loc["a", "pdf_link_candidates_from_duplicates"]
    parts = [p.strip() for p in candidates.split(";")]

    assert "https://repo.example.org/a" in parts
    assert "https://pubmed.ncbi.nlm.nih.gov/9" in parts


def test_single_member_group_writes_no_candidates():
    df = _make_df([
        {"id": "a", "is_anchor": True, "link": "https://doi.org/10.1/anchor"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    # Field stays at its initialized empty value.
    assert result.loc["a", "pdf_link_candidates_from_duplicates"] == ""


def test_group_with_no_links_writes_no_candidates():
    df = _make_df([
        {"id": "a", "is_anchor": True,  "link": ""},
        {"id": "b", "is_anchor": False, "link": ""},
        {"id": "c", "is_anchor": False, "link": ""},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    assert result.loc["a", "pdf_link_candidates_from_duplicates"] == ""


def test_group_without_anchor_is_left_untouched():
    df = _make_df([
        {"id": "a", "is_anchor": False, "link": "https://x.example.org/1"},
        {"id": "b", "is_anchor": False, "link": "https://y.example.org/2"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    assert result.loc["a", "pdf_link_candidates_from_duplicates"] == ""
    assert result.loc["b", "pdf_link_candidates_from_duplicates"] == ""


# ---------------------------------------------------------------------------
# additional_dois propagation. When the anchor absorbs a duplicate group, every
# DOI the group represents must be folded into the anchor's additional_dois,
# otherwise the dropped duplicate's DOI becomes unmatchable downstream (e.g. the
# ORCID worker explodes additional_dois and merges on doi_merge). Regression for
# the zenodo concept/version case (5771603 anchor absorbing 5833952).
# ---------------------------------------------------------------------------


def test_anchor_absorbs_duplicate_doi_into_additional_dois():
    df = _make_df([
        {"id": "a", "is_anchor": True,  "doi": "https://doi.org/10.5281/zenodo.5771603",
         "additional_dois": ["https://doi.org/10.5281/zenodo.5771603"], "oa_state": "1"},
        {"id": "b", "is_anchor": False, "doi": "https://doi.org/10.5281/zenodo.5833952",
         "additional_dois": ["https://doi.org/10.5281/zenodo.5833952"], "oa_state": "2"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    additional = result.loc["a", "additional_dois"]

    # Contract: a one-element list holding a "; "-joined string (base.R normalize_dois).
    assert isinstance(additional, list) and len(additional) == 1
    dois = [d.strip() for d in additional[0].split(";")]
    assert "https://doi.org/10.5281/zenodo.5771603" in dois
    assert "https://doi.org/10.5281/zenodo.5833952" in dois


def test_additional_dois_are_deduped_case_insensitively_and_sorted():
    df = _make_df([
        {"id": "a", "is_anchor": True,  "doi": "https://doi.org/10.1/AAA",
         "additional_dois": ["https://doi.org/10.1/AAA"], "oa_state": "1"},
        {"id": "b", "is_anchor": False, "doi": "https://dx.doi.org/10.1/aaa",
         "additional_dois": ["https://doi.org/10.1/bbb"], "oa_state": "2"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    dois = [d.strip() for d in result.loc["a", "additional_dois"][0].split(";")]

    # 10.1/AAA and 10.1/aaa collapse to one entry; output is sorted.
    assert len(dois) == 2
    assert dois == sorted(dois)


def test_single_member_group_leaves_additional_dois_untouched():
    df = _make_df([
        {"id": "a", "is_anchor": True, "doi": "https://doi.org/10.1/only",
         "additional_dois": ["https://doi.org/10.1/only"], "oa_state": "1"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    # Singleton groups are skipped, so the field is left exactly as provided.
    assert result.loc["a", "additional_dois"] == ["https://doi.org/10.1/only"]


# ---------------------------------------------------------------------------
# Known-issue tests. These document current behaviour and would need to flip
# if the filter in `apply_link_improvements` is hardened (see review notes in
# the enrichment.py logging discussion).
# ---------------------------------------------------------------------------


@pytest.mark.xfail(
    reason="Known issue: the anchor's own link can re-enter the candidate "
           "set when only the protocol differs, because the post-filter "
           "uses exact string comparison.",
    strict=True,
)
def test_anchor_link_protocol_upgrade_is_excluded():
    df = _make_df([
        {"id": "a", "is_anchor": True,  "link": "http://repo.example.org/paper/42"},
        {"id": "b", "is_anchor": False, "link": "https://repo.example.org/paper/42"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    candidates = result.loc["a", "pdf_link_candidates_from_duplicates"]
    parts = [p.strip() for p in candidates.split(";") if p.strip()]

    # Both URLs resolve to the same target; an https upgrade of the anchor's
    # own URL should not count as new candidate info.
    assert "https://repo.example.org/paper/42" not in parts


@pytest.mark.xfail(
    reason="Known issue: when the anchor link is itself multi-valued "
           "(semicolon-joined), each component is not filtered individually.",
    strict=True,
)
def test_multi_valued_anchor_link_components_are_filtered():
    df = _make_df([
        {"id": "a", "is_anchor": True,
         "link": "https://repo.example.org/a; https://repo.example.org/b"},
        {"id": "b", "is_anchor": False, "link": "https://repo.example.org/a"},
        {"id": "c", "is_anchor": False, "link": "https://pubmed.ncbi.nlm.nih.gov/9"},
    ])

    result = enrich_anchor_using_duplicates(df, _groups_for(df))
    candidates = result.loc["a", "pdf_link_candidates_from_duplicates"]
    parts = [p.strip() for p in candidates.split(";") if p.strip()]

    assert "https://repo.example.org/a" not in parts
    assert "https://pubmed.ncbi.nlm.nih.gov/9" in parts
