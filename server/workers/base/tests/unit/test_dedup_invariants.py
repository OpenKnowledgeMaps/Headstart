"""Metamorphic invariant tests for filter_duplicates.

The invariants need no ground truth, they assert relations between an input and a transformed input
(shuffled, re-fed, or with an injected record). Machinery in dedup_invariants.py.

Two kinds of tests:
  * guards: properties that hold on the current code.
  * xfail: properties the change is meant to establish. Each names the step
    that flips it to pass; remove the marker in that step.

Run from the package directory:  cd server/workers/base && pytest tests/unit
"""

import pytest

from dedup_invariants import (
    assert_idempotent,
    assert_injection,
    assert_order_invariant,
    fixture_to_df,
    load_catalog,
    load_extracted_fixtures,
    make_df,
    make_record,
    run_dedup,
)


# --- catalog & fixtures load (guards) ----------------------------------------

def test_catalog_parses_and_covers_all_fcs():
    catalog = load_catalog()
    assert catalog["schema_version"] == 1
    ids = [c["id"] for c in catalog["cases"]]
    assert len(ids) == len(set(ids)), "duplicate case ids in catalog"
    covered = {c["fc"] for c in catalog["cases"] if "fc" in c}
    assert {"FC1", "FC2", "FC3", "FC4", "FC5"} <= covered


def test_extracted_fixtures_load_and_convert():
    for corpus in ("orcid_v2", "base_v1"):
        data = load_extracted_fixtures(corpus)
        assert data["merge_fixtures"] and data["split_fixtures"]
    fx = load_extracted_fixtures("orcid_v2")["merge_fixtures"][0]
    df = fixture_to_df(fx, mark_mutual_duplicates=True)
    assert len(df) == fx["n_members"]
    assert "doi_merge" in df.columns


# --- order-invariance (the core property) ---------------------------------

def test_disjoint_records_are_order_invariant():
    # No duplicate relations at all: dedup must be a no-op in any order.
    df = make_df([
        make_record("a", title="Alpha decay measurement", doi="10.1/a"),
        make_record("b", title="Beta cell function", doi="10.1/b"),
        make_record("c", title="Gamma ray bursts", doi="10.1/c"),
    ])
    out = assert_order_invariant(df)
    assert out["ids"] == ("a", "b", "c")


def test_oa_discriminated_group_is_order_invariant():
    # The ladder discriminates (exactly one OA member): no tie to fall through.
    df = make_df([
        make_record("oa", duplicates="closed", oa_state="1", year="2020"),
        make_record("closed", duplicates="oa", oa_state="0", year="2021"),
    ])
    out = assert_order_invariant(df)
    assert out["ids"] == ("oa",)


def test_full_ladder_tie_is_order_invariant():
    # Same title group, identical oa_state and year, no DOI (X14): the ladder
    # is exhausted and the content tie-break (title, then id) must decide.
    df = make_df([
        make_record("first", duplicates="second", subject_orig="kw-a",
                    paper_abstract="An abstract about the topic A"),
        make_record("second", duplicates="first", subject_orig="kw-b",
                    paper_abstract="An abstract about the topic B"),
    ])
    assert_order_invariant(df)


def test_dataset_version_tie_is_order_invariant():
    # Two URL variants of the same DOI share an unversioned key (the key is the
    # URL path), both parse to doi_version=None, and mark_latest_doi re-picks
    # the anchor inside the group (X5): an all-NaN version sort that the
    # content tie-break must decide. DOIs must be URL-form here:
    # get_unversioned_doi keys on the URL path and returns "" for bare DOIs,
    # which would skip the group.
    df = make_df([
        make_record("v-plain", typenorm="7", duplicates="v-dx",
                    doi="https://doi.org/10.6084/m9.figshare.23691672",
                    subject_orig="kw-a"),
        make_record("v-dx", typenorm="7", duplicates="v-plain",
                    doi="https://dx.doi.org/10.6084/m9.figshare.23691672",
                    subject_orig="kw-b"),
    ])
    assert_order_invariant(df)


def test_equal_length_abstract_tie_is_order_invariant():
    # The anchor is discriminated (OA member wins), but the enriched abstract
    # must be too: two duplicates carry different abstracts of equal length
    # (X13), so the longest-wins rule ties and the text tie-break must decide.
    df = make_df([
        make_record("anchor", duplicates="d1,d2", oa_state="1",
                    paper_abstract=""),
        make_record("d1", duplicates="anchor,d2", oa_state="0",
                    paper_abstract="Equal length abstract text A"),
        make_record("d2", duplicates="anchor,d1", oa_state="0",
                    paper_abstract="Equal length abstract text B"),
    ])
    assert_order_invariant(df)


# --- idempotence / duplication-invariance (guards) ---------------------

def test_dedup_is_idempotent():
    df = make_df([
        make_record("oa", duplicates="closed", oa_state="1", year="2020"),
        make_record("closed", duplicates="oa", oa_state="0", year="2021"),
        make_record("solo", title="An unrelated record", doi="10.1/solo"),
    ])
    assert_idempotent(df)


def test_exact_copy_is_absorbed():
    df = make_df([
        make_record("a", title="Alpha decay measurement", doi="10.1/a"),
        make_record("b", title="Beta cell function", doi="10.1/b"),
    ])
    copy_of_a = make_record("a", title="Alpha decay measurement", doi="10.1/a")
    assert_injection(df, copy_of_a, expected_delta=0)


# --- merge-injection: the DOI-grouping gap -------------------

def test_same_doi_unmarked_is_merged():
    # Same DOI, different titles, no duplicates marking: the title pass sees
    # nothing; the DOI-key grouping must merge them.
    df = make_df([
        make_record("plain", doi="10.1234/test",
                    title="Detecting moments of stress"),
    ])
    journal_copy = make_record(
        "journal", doi="10.1234/test",
        title="Sensors / Detecting moments of stress")
    assert_injection(df, journal_copy, expected_delta=0)


def test_doi_only_in_doi_merge_is_merged():
    # the observation gap: the DOI lives in the dcdoi-derived doi_merge
    # while the link-derived `doi` is empty: the coalesced key must merge.
    df = make_df([
        make_record("linkdoi", doi="10.1234/test",
                    title="Detecting moments of stress"),
    ])
    dcdoi_copy = make_record(
        "dcdoi", doi="", doi_merge="https://dx.doi.org/10.1234/TEST",
        title="Sensors / Detecting moments of stress")
    assert_injection(df, dcdoi_copy, expected_delta=0)


def test_case_variant_dois_are_merged():
    # case-only DOI variants share the lowercased key.
    df = make_df([
        make_record("upper", doi="https://doi.org/10.1016/B978.12",
                    title="Chapter on sensing"),
    ])
    lower_copy = make_record("lower", doi="https://doi.org/10.1016/b978.12",
                             title="Chapter on sensing")
    assert_injection(df, lower_copy, expected_delta=0)


def test_dataset_version_group_merges_to_latest():
    # version variants share the unversioned key on the dataset path,
    # where mark_latest_doi decides; the anchor must be the latest version,
    # in any input order. (On the non-dataset path the OA/year ladder ranks
    # above the version, so this expectation is dataset-specific.)
    df = make_df([
        make_record("v1", typenorm="7",
                    doi="https://doi.org/10.6084/m9.figshare.111.v1",
                    title="A dataset of measurements"),
        make_record("v3", typenorm="7",
                    doi="https://doi.org/10.6084/m9.figshare.111.v3",
                    title="A dataset of measurements"),
    ])
    out = assert_order_invariant(df)
    assert out["ids"] == ("v3",)


def test_same_doi_unrelated_titles_are_not_absorbed():
    # two genuinely different papers mis-indexed under one DOI. The
    # doi_title_filter guard (now on the DOI-key groups) drops the
    # false-positive side; which paper survives is arbitrary by nature, but
    # the survivor must be deterministic and must not have absorbed the other
    # paper's keywords.
    subjects = {"real": "quantum optics", "misindexed": "medieval history"}
    df = make_df([
        make_record("real", doi="10.1234/shared", oa_state="1",
                    title="Quantum entanglement in photonic crystals",
                    subject_orig=subjects["real"]),
        make_record("misindexed", doi="10.1234/shared",
                    title="Medieval trade routes of the Baltic",
                    subject_orig=subjects["misindexed"]),
    ])
    out = assert_order_invariant(df)
    assert len(out["ids"]) == 1
    survivor = out["ids"][0]
    assert out["records"][survivor]["subject_orig"] == subjects[survivor]


def test_distinct_papers_with_article_number_suffixes_stay_separate():
    # Elsevier-style DOIs of distinct papers in one journal batch differ only
    # in the trailing article number; the key must not strip it and collide
    # them (which would let the title guard drop a real paper).
    df = make_df([
        make_record("paper-a", doi="https://dx.doi.org/10.1016/j.physleta.2015.07.045",
                    title="Entangled entanglement: A construction procedure"),
        make_record("paper-b", oa_state="1",
                    additional_dois=["https://doi.org/10.1016/j.physleta.2015.07.030"],
                    title="Weak interaction processes: Which quantum information is revealed?"),
    ])
    out = assert_order_invariant(df)
    assert out["ids"] == ("paper-a", "paper-b")


def test_dcdoi_asserted_same_work_with_retitled_preprint_merges_and_keeps_oa():
    # via dcdoi: a repository copy under the preprint's old title asserts
    # the published DOI in additional_dois. It must merge with the publisher
    # record: exempt from the doi_title_filter guard despite the dissimilar
    # title: and its OA state must survive onto the anchor.
    df = make_df([
        make_record("publisher", oa_state="2",
                    doi="https://dx.doi.org/10.1016/j.physleta.2015.07.045",
                    title="Entangled entanglement: A construction procedure"),
        make_record("repo-copy", oa_state="1", doi="",
                    additional_dois=["https://doi.org/10.1016/j.physleta.2015.07.045"],
                    title="Entangled Entanglement: The Geometry of GHZ States"),
    ])
    out = assert_order_invariant(df)
    assert len(out["ids"]) == 1
    assert str(out["records"][out["ids"][0]]["oa_state"]) == "1"


def test_overlapping_groups_are_order_invariant():
    # Real-world topology (an ORCID base batch): four copies of one work —
    # journal + repository sharing the journal DOI key, an arXiv-collection
    # copy also keyed on the journal DOI, and a DataCite copy whose PRIMARY
    # key is the arXiv DOI (first in its dcdoi) but which the textual pass
    # pairs with the arXiv copy. The textual pair bridges two DOI-key groups,
    # so the groups OVERLAP; the anchor re-marking across overlapping groups
    # must not depend on group iteration order (= row order before the fix).
    df = make_df([
        make_record("journal", oa_state="1", year="2023",
                    doi="https://doi.org/10.1088/1361-6471/ac9fe6",
                    title="On the geometric phase for Majorana and Dirac neutrinos",
                    paper_abstract="A" * 100),
        make_record("salerno", oa_state="2", year="2023", doi="",
                    additional_dois=["https://doi.org/10.1088/1361-6471/ac9fe6"],
                    title="On the geometric phase for Majorana and Dirac neutrinos",
                    paper_abstract="B" * 90),
        make_record("arxiv-copy", oa_state="1", year="2022", doi="",
                    additional_dois=["https://doi.org/10.1088/1361-6471/ac9fe6"],
                    duplicates="datacite",
                    title="On the geometric phase for Majorana and Dirac neutrinos",
                    paper_abstract="C" * 95),
        make_record("datacite", oa_state="1", year="2022", doi="",
                    additional_dois=["https://doi.org/10.48550/arxiv.2107.08719; "
                                     "https://doi.org/10.1088/1361-6471/ac9fe6"],
                    duplicates="arxiv-copy",
                    title="On the geometric phase for Majorana and Dirac neutrinos",
                    paper_abstract="D" * 105),
    ])
    assert_order_invariant(df)


def test_doi_group_straddling_typenorm_split_keeps_one_survivor():
    # a DOI-key group whose members land on different sides of the
    # dataset/non-dataset split must not end up with an anchor on each side.
    df = make_df([
        make_record("dataset-side", typenorm="7", doi="10.5281/zenodo.42",
                    title="A shared resource"),
        make_record("paper-side", typenorm="1", doi="10.5281/zenodo.42",
                    title="A shared resource"),
    ])
    out = assert_order_invariant(df)
    assert len(out["ids"]) == 1


def test_idempotent_after_doi_merge():
    # A DOI-merged survivor set re-fed must not change again.
    df = make_df([
        make_record("plain", doi="10.1234/test", oa_state="1",
                    title="Detecting moments of stress"),
        make_record("journal", doi="10.1234/test",
                    title="Sensors / Detecting moments of stress"),
        make_record("solo", doi="10.1/solo", title="An unrelated record"),
    ])
    assert_idempotent(df)


# --- characterization (scope note, not an invariant) ---------------------

def test_same_title_different_doi_currently_merges():
    # Two records the title pass marked as duplicates, carrying different DOIs.
    # Current behaviour: they collapse to one anchor. The PID-conflict split
    # that would keep both is the hybrid mechanism: out of scope for the
    # DOI-based solution; this test
    # pins the behaviour so a scope change is a conscious decision.
    df = make_df([
        make_record("arxiv", duplicates="journal", doi="10.48550/arxiv.1",
                    title="Designing intent communication"),
        make_record("journal", duplicates="arxiv", doi="10.1145/3771882",
                    title="Designing intent communication"),
    ])
    out = run_dedup(df)
    assert len(out["ids"]) == 1


# --- real extracted fixtures ------------------------------------------------

def test_real_merge_fixtures_collapse_on_doi_key_alone():
    # The purpose: real duplicate groups must collapse via the DOI key even
    # when the textual pass did not mark them (mark_mutual_duplicates=False).
    # Fixtures whose members only share a key under bare-.N version stripping
    # (which the key deliberately does not do) rely on the title pass instead
    # and are asserted through that path.
    from common.deduplication import add_doi_keys

    for corpus in ("orcid_v2", "base_v1"):
        data = load_extracted_fixtures(corpus)
        fixtures = [f for f in data["merge_fixtures"]
                    if f.get("pid_namespace") == "doi"][:40]
        for fx in fixtures:
            df = fixture_to_df(fx, mark_mutual_duplicates=False)
            single_key = add_doi_keys(df.copy())["doi_key"].nunique() == 1
            if not single_key:
                df = fixture_to_df(fx, mark_mutual_duplicates=True)
            out = run_dedup(df)
            assert len(out["ids"]) == fx["expected"]["groups"], (
                f"{corpus} {fx['pid_key']} (single_key={single_key}): expected "
                f"{fx['expected']['groups']} group(s), got {out['ids']}"
            )


def test_real_split_fixtures_never_merge_across_distinct_keys():
    # Same-title/different-primary-DOI groups, unmarked: survivors must map
    # 1:1 onto the distinct coalesced DOI keys (keyless members stay alone).
    # Members labelled 'split' by primary DOI can legitimately merge when a
    # secondary DOI in additional_dois is shared: e.g. a repository copy
    # carrying the journal DOI in its dcdoi: so the expectation is derived
    # from the coalesced keys, not from the extraction tool's label.
    from common.deduplication import add_doi_keys

    for corpus in ("orcid_v2", "base_v1"):
        data = load_extracted_fixtures(corpus)
        for fx in data["split_fixtures"][:40]:
            df = fixture_to_df(fx, mark_mutual_duplicates=False)
            keys = add_doi_keys(df.copy())["doi_key"].tolist()
            expected = len({k for k in keys if k}) + sum(1 for k in keys if not k)
            out = run_dedup(df)
            assert len(out["ids"]) == expected, (
                f"{corpus} {fx['title_key'][:40]!r}: keys={keys}, "
                f"expected {expected} survivor(s), got {out['ids']}"
            )


# --- on real extracted fixtures ------------------------------------------

def test_real_merge_fixtures_are_order_invariant():
    # Real merge groups from the extracted corpora, each run with the mutual
    # duplicates marking the title pass would have produced.
    for corpus in ("orcid_v2", "base_v1"):
        fixtures = load_extracted_fixtures(corpus)["merge_fixtures"][:25]
        for fx in fixtures:
            df = fixture_to_df(fx, mark_mutual_duplicates=True)
            assert_order_invariant(df)
