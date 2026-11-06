"""Harness for deduplication determinism tests.

one universal envelope built on metamorphic invariants, applied to
`filter_duplicates` end-to-end. This module provides the shared machinery; the
invariant tests themselves live in test_dedup_invariants.py.

Provides:
  * record/DataFrame builders with the columns filter_duplicates requires
  * deterministic input permutations (I1 order-invariance is the core property)
  * a canonical, comparable outcome of a filter_duplicates run
  * assertion helpers for the invariants I1-I7
  * loaders for the machine-readable test-case catalog
    (tests/base-dedup-test-cases.yaml) and the extracted real-record fixtures
    (tests/fixtures/*.json)
"""

import ast
import json
from pathlib import Path

import pandas as pd
import yaml

from base import filter_duplicates


# --- paths ------------------------------------------------------------------

TESTS_DIR = Path(__file__).resolve().parents[1]          # server/workers/base/tests
CATALOG_PATH = TESTS_DIR / "base-dedup-test-cases.yaml"
FIXTURES_DIR = TESTS_DIR / "fixtures"


def load_catalog():
    """The test-case catalog (schema_version 1) as a dict."""
    with open(CATALOG_PATH) as fh:
        return yaml.safe_load(fh)


def load_extracted_fixtures(corpus="orcid_v2"):
    """Extracted real-record fixtures: dict with merge_fixtures / split_fixtures."""
    with open(FIXTURES_DIR / f"{corpus}_fixtures.json") as fh:
        return json.load(fh)


# --- record / DataFrame builders --------------------------------------------

# Every column filter_duplicates reads from its input.
RECORD_DEFAULTS = {
    "id": "",
    "title": "Title",
    "doi": "",
    "duplicates": "",          # the R-side textual-duplicate marking
    "typenorm": "1",           # "7" = dataset path
    "is_duplicate": False,
    "link": "",
    "identifier": "",
    "oa_state": "0",
    "year": "2020",
    "collection": "",
    "paper_abstract": "Abstract",
    "authors": "Author A",
    "published_in": "Journal",
    "subject": "",
    "subject_orig": "",
    "content_provider": "cp1",
}

DEFAULT_PARAMS = {"vis_id": "test", "list_size": 100}


def make_record(id, **overrides):
    rec = dict(RECORD_DEFAULTS)
    rec["id"] = id
    rec.update(overrides)
    return rec


def make_df(rows):
    """rows: list of dicts (partial ok, defaults are filled in)."""
    return pd.DataFrame([{**RECORD_DEFAULTS, **r} for r in rows])


def fixture_to_df(fixture, mark_mutual_duplicates=False):
    """Build a filter_duplicates input from one extracted merge/split fixture.

    `mark_mutual_duplicates=True` simulates the upstream R textual-duplicate
    marking by listing every member in every member's `duplicates` column —
    use it when the scenario assumes the title pass has already linked the
    group. additional_dois arrives as a stringified list and is converted back
    to the real list the base.R contract provides at dedup time.
    """
    members = fixture["members"]
    ids = [m["id"] for m in members]
    rows = []
    for m in members:
        row = {k: v for k, v in m.items() if k in RECORD_DEFAULTS or k in
               ("doi_merge", "additional_dois", "relation")}
        row.pop("abstract_len", None)
        if isinstance(row.get("additional_dois"), str) and \
                row["additional_dois"].startswith("["):
            row["additional_dois"] = ast.literal_eval(row["additional_dois"])
        if mark_mutual_duplicates:
            row["duplicates"] = ",".join(ids)
        rows.append({**RECORD_DEFAULTS, **row})
    return pd.DataFrame(rows)


def parse_additional_dois(value):
    """Fixture additional_dois is a stringified list of '; '-joined DOIs."""
    if not value:
        return []
    items = ast.literal_eval(value) if isinstance(value, str) else value
    out = []
    for item in items:
        out.extend(d.strip() for d in item.split(";") if d.strip())
    return out


# --- running & comparing ----------------------------------------------------

# Seeds for the deterministic permutations; identity order is always included.
PERMUTATION_SEEDS = (11, 23, 47)

# The dedup-sensitive fields a tie-break flip can move (anchor identity plus
# everything enrichment writes). Compared per surviving id.
OUTCOME_FIELDS = ("title", "doi", "subject_orig", "subject", "oa_state",
                  "link", "paper_abstract")


def permutations_of(df):
    """The identity order, the reversal, and a fixed set of seeded shuffles.

    The reversal is always included because seeded sampling can reproduce the
    identity order on small frames, which would void the invariance check.
    """
    yield df.copy()
    yield df.iloc[::-1].reset_index(drop=True)
    for seed in PERMUTATION_SEEDS:
        yield df.sample(frac=1, random_state=seed).reset_index(drop=True)


def run_dedup(df, params=None):
    """filter_duplicates on a copy, returning the canonical outcome."""
    filtered = filter_duplicates(df.copy(), "test_service",
                                 dict(params or DEFAULT_PARAMS))
    return outcome(filtered)


def outcome(filtered):
    """Canonical, order-independent representation of a dedup result."""
    records = {}
    for _, row in filtered.iterrows():
        records[row["id"]] = {f: row.get(f, "") for f in OUTCOME_FIELDS}
    return {"ids": tuple(sorted(records)), "records": records}


def describe_diff(a, b):
    """Short human-readable diff between two outcomes, for assertion messages."""
    if a["ids"] != b["ids"]:
        return f"survivor sets differ: {a['ids']} vs {b['ids']}"
    diffs = []
    for _id in a["ids"]:
        for f in OUTCOME_FIELDS:
            va, vb = a["records"][_id][f], b["records"][_id][f]
            if va != vb:
                diffs.append(f"{_id}.{f}: {va!r} != {vb!r}")
    return "; ".join(diffs) or "identical"


# --- invariant assertions -------------------------------------------

def assert_order_invariant(df, params=None):
    """I1: dedup(shuffle(C)) == dedup(C) on survivors and enriched fields."""
    baseline = None
    for i, perm in enumerate(permutations_of(df)):
        out = run_dedup(perm, params)
        if baseline is None:
            baseline = out
        else:
            assert out == baseline, (
                f"I1 violated on permutation {i}: {describe_diff(baseline, out)}"
            )
    assert baseline is not None
    return baseline


def assert_idempotent(df, params=None):
    """I2: dedup(dedup(C)) == dedup(C).

    In the real pipeline both `duplicates` and `is_duplicate` are computed
    upstream (the R textual-duplicate marking) before filter_duplicates runs.
    Re-feeding therefore resets both, modelling the upstream marker running
    again on the survivor set and finding nothing: the second pass must then
    change nothing. (Without the reset, a surviving anchor keeps
    is_duplicate=True and base.py's non-duplicate default never re-anchors it.)
    """
    first = filter_duplicates(df.copy(), "test_service",
                              dict(params or DEFAULT_PARAMS))
    refeed = first.copy()
    refeed["duplicates"] = ""
    refeed["is_duplicate"] = False
    second = filter_duplicates(refeed.copy(), "test_service",
                               dict(params or DEFAULT_PARAMS))
    a, b = outcome(first), outcome(second)
    assert a == b, f"I2 violated: {describe_diff(a, b)}"
    return a


def assert_injection(df, record, expected_delta, params=None):
    """I3/I4/I5/I6 core: adding `record` changes the survivor count by
    exactly `expected_delta` (0 = absorbed/merged, 1 = kept separate)."""
    before = run_dedup(df, params)
    after = run_dedup(pd.concat([df, make_df([record])], ignore_index=True),
                      params)
    delta = len(after["ids"]) - len(before["ids"])
    assert delta == expected_delta, (
        f"injection changed survivor count by {delta}, expected {expected_delta} "
        f"(before={before['ids']}, after={after['ids']})"
    )
    return before, after
