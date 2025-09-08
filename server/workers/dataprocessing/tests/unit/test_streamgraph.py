import pytest
import json
import numpy as np
import pandas as pd
from datetime import datetime
from itertools import chain

from streamgraph import (
    Streamgraph,
    aggregate_ids,
    stopwords
)

# -----------------------------
# Tests for individual methods
# -----------------------------

def test_tokenize():
    sg = Streamgraph(loglevel="ERROR")
    s = "Hello (world); Test; (example)"
    # Parentheses are removed, then split on "; "
    tokens = sg.tokenize(s)
    expected = ["Hello world", "Test", "example"]
    assert tokens == expected

def test_get_x_axis():
    daterange = pd.to_datetime(["2020-01-01", "2021-01-01", "2022-01-01"])
    x = Streamgraph.get_x_axis(daterange)
    assert x == ["2020", "2021", "2022"]

def test_get_daterange():
    years = pd.to_datetime(["2020-01-01", "2021-01-01", "2022-01-01"])
    boundaries = pd.DataFrame({"boundary_label": years, "year": years})
    dr = Streamgraph.get_daterange(boundaries)
    expected = sorted(list(years))
    assert dr == expected

def test_get_stream_range():
    years = pd.to_datetime(["2020-01-01", "2022-01-01"])
    df = pd.DataFrame({"year": years})
    sr = Streamgraph.get_stream_range(df)
    assert sr["min"] == pd.Timestamp("2020-01-01")
    assert sr["max"] == pd.Timestamp("2022-01-01")
    assert sr["range"] == pd.Timestamp("2022-01-01") - pd.Timestamp("2020-01-01")

def test_get_counts():
    data = {
        "year": [pd.Timestamp("2020-01-01"), pd.Timestamp("2020-01-01"), pd.Timestamp("2021-01-01")],
        "subject": ["history", "history", "science"],
        "id": ["1", "2", "3"]
    }
    df = pd.DataFrame(data)
    counts = Streamgraph.get_counts(df)
    row = counts[(counts.year == pd.Timestamp("2020-01-01")) & (counts.subject == "history")]
    assert int(row["counts"].iloc[0]) == 2

def test_get_boundaries():
    years = pd.to_datetime(["2020-01-01", "2021-01-01", "2020-01-01"])
    df = pd.DataFrame({"boundary_label": years, "year": years})
    boundaries = Streamgraph.get_boundaries(df)
    assert len(boundaries) == 2

def test_get_top_n_count():
    sg = Streamgraph(loglevel="ERROR")
    data = {
        "id": ["1", "2", "3"],
        "year": ["2020-01-01", "2020-01-01", "2020-01-01"],
        "subject": ["history; science", "history; math", "science; math"]
    }
    df = pd.DataFrame(data)
    top_n = sg.get_top_n(df, query="dummy", n=2, method="count")
    assert isinstance(top_n, list)

def test_get_top_words():
    topic = np.array([0.1, 0.5, 0.3])
    feature_names = ["a", "bb", "ccc"]
    top_words = Streamgraph.get_top_words(topic, feature_names, 2)
    assert top_words == ["ccc", "bb"]

# -----------------------------
# Tests for composite methods
# -----------------------------

def test_build_sg_data():
    sg = Streamgraph(loglevel="ERROR")
    daterange = pd.to_datetime(["2020-01-01", "2021-01-01", "2022-01-01"])
    df = pd.DataFrame({
        "year": [pd.Timestamp("2020-01-01")] * 3,
        "subject": ["history"] * 3,
        "counts": [1, 1, 1],
        "id": ["1", "2", "3"],
        "boundary_label": [pd.Timestamp("2020-01-01")] * 3
    })
    df["ids_timestep"] = [["1"], ["2"], ["3"]]
    top_n = ["history"]
    x, subject_data = sg.build_sg_data(daterange, df, top_n)
    assert isinstance(x, list)
    assert isinstance(subject_data, list)
    if subject_data:
        for rec in subject_data:
            for key in ["name", "y", "ids_timestep", "ids_overall"]:
                assert key in rec

def test_reduce_metadata_set():
    sg = Streamgraph(loglevel="ERROR")
    metadata = pd.DataFrame([
        {"id": "1", "title": "A"},
        {"id": "2", "title": "B"},
        {"id": "3", "title": "C"}
    ]).to_json(orient="records")
    sg_data = {"subject": [{"ids_overall": ["1", "3"]}]}
    reduced = sg.reduce_metadata_set(metadata, sg_data)
    reduced_df = pd.read_json(reduced)
    assert set(reduced_df["id"]) == {"1", "3"}

# -----------------------------
# Integration test for streamgraph data generation
# -----------------------------

def test_get_streamgraph_data():
    sg = Streamgraph(loglevel="ERROR")
    metadata = [
        {"id": "1", "year": "2020-05-01", "subject": "History; Science"},
        {"id": "2", "year": "2021-03-15", "subject": "History; Math"},
        {"id": "3", "year": "2022-07-20", "subject": "Science; Math"}
    ]
    query = "dummy"
    sg_data = sg.get_streamgraph_data(metadata, query, n=1, method="count")
    assert "x" in sg_data
    assert "subject" in sg_data
    assert isinstance(sg_data["x"], list)
    assert isinstance(sg_data["subject"], list)