"""Unit tests for `process_oa_state_element` in common.enrichment.

These exercise the priority-pick logic directly, without running the full
`enrich_anchor_using_duplicates` pipeline. Priority is "1" (yes) >
"0" (no) > "2" (unknown).

Run from the package directory:

    cd server/workers/common && pytest tests/test_process_oa_state.py
"""

import numpy as np
import pandas as pd
import pytest

from common.enrichment import process_oa_state_element


def _fresh_acc():
    return {"best_value": None, "best_priority": float("inf")}


def test_yes_beats_unknown():
    acc = _fresh_acc()
    process_oa_state_element("2", acc)
    process_oa_state_element("1", acc)
    assert acc["best_value"] == "1"


def test_yes_beats_no():
    acc = _fresh_acc()
    process_oa_state_element("0", acc)
    process_oa_state_element("1", acc)
    assert acc["best_value"] == "1"


def test_no_beats_unknown():
    acc = _fresh_acc()
    process_oa_state_element("2", acc)
    process_oa_state_element("0", acc)
    assert acc["best_value"] == "0"


def test_better_existing_is_kept():
    acc = _fresh_acc()
    process_oa_state_element("1", acc)
    process_oa_state_element("2", acc)
    assert acc["best_value"] == "1"


def test_nan_is_ignored():
    acc = _fresh_acc()
    process_oa_state_element(np.nan, acc)
    assert acc["best_value"] is None
    assert acc["best_priority"] == float("inf")


def test_unknown_string_does_not_win_against_known():
    acc = _fresh_acc()
    process_oa_state_element("2", acc)
    process_oa_state_element("garbage", acc)
    assert acc["best_value"] == "2"


@pytest.mark.parametrize("value", ["1", 1, 1.0])
def test_yes_value_wins_regardless_of_numeric_type(value):
    """`oa_state` arrives as a string in BASE but other workers (e.g. orcid)
    cast it to int, and pandas may upcast to float after a left-join that
    introduces NaN. The priority pick should treat all three as 'yes'."""
    acc = _fresh_acc()
    process_oa_state_element("2", acc)
    process_oa_state_element(value, acc)
    assert acc["best_value"] == value, (
        f"value={value!r} (type={type(value).__name__}) was not recognised "
        f"as oa_state=yes; accumulator ended at {acc!r}"
    )
