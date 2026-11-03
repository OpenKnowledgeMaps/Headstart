"""select_rows_per_doi: deterministic per-DOI selection for ORCID enrichment.

Pins the regression found on ORCID 0000-0001-9612-7791 (BMJ co-publication
10.1136/bmj-2022-070904): with no direct-fetch candidate, the previous
unstable-quicksort tie let an abstract-less bibliography polluter win the
enrichment row depending on frame layout.
"""

import pandas as pd
import pytest

from common import enrichment

# The deterministic per-DOI selection (companion fix of the abandoned
# polishing outcome 2) is not implemented on this branch; these tests are
# its acceptance suite and self-enable when the function exists again.
pytestmark = pytest.mark.skipif(
    not hasattr(enrichment, "select_rows_per_doi"),
    reason="select_rows_per_doi not implemented (outcome 2 abandoned)",
)
select_rows_per_doi = getattr(enrichment, "select_rows_per_doi", None)

BMJ = "10.1136/bmj-2022-070904"


def make_frame(rows):
    return pd.DataFrame(rows, columns=[
        "id", "title", "paper_abstract", "doi_merge",
        "_is_direct_fetch", "_dcdoi_pos",
    ])


def bmj_candidates():
    # Field-accurate shape of the live candidate set (vis 00da83b2, rev 1/2):
    # every row non-direct; the polluter cites the DOI deep in its dcdoi
    # bibliography and has no abstract; the article anchor asserts it at
    # position 2 with the full abstract.
    return [
        ("aaa-polluter", "AI and digital health in Colombia", "", BMJ, False, 30),
        ("mmm-maastricht", "Reporting guideline (Maastricht copy)", "A" * 1905, BMJ, False, 2),
        ("fff-fairsharing", "FAIRsharing record for: DECIDE-AI", "F" * 928, BMJ, False, 1),
        ("zzz-article", "Reporting guideline (article anchor)", "B" * 2038, BMJ, False, 2),
    ]


def winner(df, key=BMJ):
    out = select_rows_per_doi(df)
    row = out[out["doi_merge"].str.lower() == key]
    assert len(row) == 1
    return row.iloc[0]


def test_bibliography_polluter_never_beats_a_work_row():
    w = winner(make_frame(bmj_candidates()))
    assert w["id"] == "zzz-article"
    assert len(w["paper_abstract"]) == 2038


def test_selection_is_layout_invariant():
    rows = bmj_candidates()
    baseline = winner(make_frame(rows))["id"]
    # reversed order, shuffled order, and padded frames (extra unrelated keys
    # change the frame size — the trigger of the historical flip)
    padding = [(f"pad{i}", "Other", "x" * i, f"10.1000/pad{i}", True, 0)
               for i in range(17)]
    for variant in (rows[::-1],
                    [rows[2], rows[0], rows[3], rows[1]],
                    padding[:9] + rows + padding[9:],
                    rows[::-1] + padding):
        assert winner(make_frame(variant))["id"] == baseline


def test_direct_fetch_beats_everything():
    rows = bmj_candidates() + [
        ("ddd-direct", "Directly fetched record", "", BMJ, True, 0),
    ]
    assert winner(make_frame(rows))["id"] == "ddd-direct"


def test_deep_dcdoi_position_loses_despite_longer_abstract():
    rows = [
        ("aaa-deep", "Citing record", "C" * 5000, BMJ, False, 12),
        ("bbb-shallow", "Asserting record", "D" * 100, BMJ, False, 1),
    ]
    assert winner(make_frame(rows))["id"] == "bbb-shallow"


def test_full_tie_breaks_on_id():
    rows = [
        ("bbb", "Copy B", "same", BMJ, False, 1),
        ("aaa", "Copy A", "same", BMJ, False, 1),
    ]
    assert winner(make_frame(rows))["id"] == "aaa"
    assert winner(make_frame(rows[::-1]))["id"] == "aaa"
