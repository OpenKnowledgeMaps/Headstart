import os
import json
import re
import subprocess
import time
import pytest
import pandas as pd
from io import StringIO

# Import the BaseClient and parser functions from your source.
from base import BaseClient, filter_duplicates, parse_annotations_for_all, sanitize_authors

# --- Dummy implementations for dependencies ---

class DummyRedis:
    def __init__(self):
        self.store = {}
        self.queue = []

    def blpop(self, key, timeout=0):
        if self.queue:
            return (key, self.queue.pop(0))
        else:
            time.sleep(timeout)
            return None

    def rpush(self, key, value):
        self.queue.append(value)

    def llen(self, key):
        return len(self.queue)

    def set(self, key, value):
        self.store[key] = value

class DummyLogger:
    def debug(self, msg):
        pass
    def error(self, msg):
        pass
    def exception(self, msg):
        pass

# A simple dummy R-wrapper. (RWrapper is your real dependency.)
class DummyRWrapper:
    def __init__(self, *args):
        self.redis_store = DummyRedis()
        self.command = "dummy_command"
        self.runner = "dummy_runner"
        self.wd = "/dummy/wd"
        self.logger = DummyLogger()

# For testing, we create a subclass that combines your BaseClient with our dummy RWrapper.
class TestBaseClient(BaseClient, DummyRWrapper):
    def __init__(self, *args, **kwargs):
        DummyRWrapper.__init__(self, *args, **kwargs)
        try:
            # In __init__, BaseClient calls get_contentproviders.
            result = self.get_contentproviders()
            df = pd.DataFrame(json.loads(result["contentproviders"]))
            df.set_index("name", inplace=True)
            cp_dict = df.internal_name.to_dict()
            self.content_providers = cp_dict
        except Exception as e:
            self.logger.error(e)
            self.content_providers = {}

    # Provide a dummy add_default_params method required by next_item.
    def add_default_params(self, params):
        return params

# --- Fixtures ---

@pytest.fixture
def client_base():
    # Create an instance of TestBaseClient.
    client = TestBaseClient("dummy_script", "dummy_runner", DummyRedis(), "english", "DEBUG")
    # Override get_contentproviders to return a fixed dummy result.
    client.get_contentproviders = lambda: {
        "contentproviders": json.dumps([{"name": "cp1", "internal_name": "Provider1"}])
    }
    return client


def _make_record(id, title="Title", doi="", duplicates="", typenorm="1",
                 is_duplicate=False, link="", identifier="", oa_state="0",
                 year="2020", collection="", paper_abstract="Abstract",
                 authors="Author A", published_in="Journal", subject="",
                 subject_orig="", content_provider="cp1"):
    """Build a minimal record dict with all columns required by filter_duplicates."""
    return {
        "id": id,
        "title": title,
        "doi": doi,
        "duplicates": duplicates,
        "typenorm": typenorm,
        "is_duplicate": is_duplicate,
        "link": link,
        "identifier": identifier,
        "oa_state": oa_state,
        "year": year,
        "collection": collection,
        "paper_abstract": paper_abstract,
        "authors": authors,
        "published_in": published_in,
        "subject": subject,
        "subject_orig": subject_orig,
        "content_provider": content_provider,
    }


_DEFAULT_PARAMS = {"vis_id": "test", "list_size": 100}


# --- Tests for BaseClient methods ---

def test_next_item(client_base):
    # Prepare a dummy message in the redis_store queue.
    message = {"id": "123", "params": {"q": "test"}, "endpoint": "search"}
    encoded_message = json.dumps(message).encode("utf-8")
    client_base.redis_store.queue.append(encoded_message)

    request_id, params, endpoint = client_base.next_item()
    assert request_id == "123"
    assert params.get("q") == "test"
    # The method adds "service": "base" to params.
    assert params.get("service") == "base"
    assert endpoint == "search"

def test_execute_search(client_base, monkeypatch):
    # Patch subprocess.Popen to simulate a process returning dummy output.
    class DummyProcess:
        def __init__(self, stdout, stderr):
            self._stdout = stdout
            self._stderr = stderr
        def communicate(self, input=None):
            return (self._stdout, self._stderr)

    def dummy_popen(cmd, stdin, stdout, stderr, encoding):
        # Simulate output with several lines.
        # Return a list of dictionaries containing required columns.
        dummy_row = {
            "id": "row1",
            "title": "Test Title",
            "paper_abstract": "Abstract",
            "subject_orig": "Subject",
            "published_in": "Journal",
            "sanitized_authors": "Author"
        }
        dummy_stdout = "irrelevant line\n" + json.dumps([dummy_row]) + "\nextra line\n"
        dummy_stderr = ""
        return DummyProcess(dummy_stdout, dummy_stderr)

    monkeypatch.setattr(subprocess, "Popen", dummy_popen)

    # Patch methods used inside execute_search.
    monkeypatch.setattr(client_base, "sanitize_metadata", lambda df: df)
    # filter_duplicates takes (df, service, params): use correct arity
    monkeypatch.setattr("base.filter_duplicates", lambda df, service, params: df)
    monkeypatch.setattr("base.parse_annotations_for_all", lambda metadata, field:
                        pd.DataFrame({"annotations": [{}] * len(metadata)}))
    monkeypatch.setattr(client_base, "enrich_metadata", lambda df: pd.concat(
        [df, pd.DataFrame({"enriched": ["yes"] * len(df)})], axis=1))

    params = {"q": "dummy query", "service": "base", "list_size": 100}
    res = client_base.execute_search(params)
    assert isinstance(res, dict)
    assert "input_data" in res
    assert "params" in res


def test_execute_search_emits_deterministic_row_order(client_base, monkeypatch):
    """The emitted metadata order must not depend on BASE's response order.

    The relevance ranking decides the head(list_size) cutoff and stays
    available in the `relevance` column; the serialized rows are sorted by id
    so downstream consumers (persistence, dataprocessing) receive an
    order-stable artifact.
    """
    class DummyProcess:
        def __init__(self, stdout):
            self._stdout = stdout
        def communicate(self, input=None):
            return (self._stdout, "")

    def make_popen(rows):
        def dummy_popen(cmd, stdin, stdout, stderr, encoding):
            return DummyProcess("header\n" + json.dumps(rows) + "\ntrailer\n")
        return dummy_popen

    rows = [
        {"id": i, "title": f"Title {i}", "paper_abstract": "A",
         "subject_orig": "S", "published_in": "J", "sanitized_authors": "X"}
        for i in ("ccc", "aaa", "bbb")
    ]

    monkeypatch.setattr(client_base, "sanitize_metadata", lambda df: df)
    monkeypatch.setattr("base.filter_duplicates", lambda df, service, params: df)
    monkeypatch.setattr("base.parse_annotations_for_all", lambda metadata, field:
                        pd.DataFrame({"annotations": [{}] * len(metadata)}))
    monkeypatch.setattr(client_base, "enrich_metadata", lambda df: df)

    params = {"q": "dummy query", "service": "base", "list_size": 100}
    emissions = []
    for order in (rows, rows[::-1]):
        monkeypatch.setattr(subprocess, "Popen", make_popen(order))
        res = client_base.execute_search(params)
        ids = [r["id"] for r in json.loads(res["input_data"]["metadata"])]
        emissions.append(ids)

    assert emissions[0] == emissions[1] == ["aaa", "bbb", "ccc"]

def test_sanitize_metadata(client_base):
    # Create a dummy DataFrame with an "authors" column.
    df = pd.DataFrame({"authors": ["John Doe; Jane Smith"], "year": ["2020"]})
    sanitized = client_base.sanitize_metadata(df)
    assert "sanitized_authors" in sanitized.columns
    # Expect the authors string to be unchanged by our dummy sanitizer.
    assert sanitized["sanitized_authors"].iloc[0] == "John Doe; Jane Smith"

def test_enrich_metadata(client_base, monkeypatch):
    # Create a dummy DataFrame with a "content_provider" column.
    df = pd.DataFrame({"content_provider": ["cp1"]})
    client_base.content_providers = {"cp1": "Provider1"}
    dummy_enrichment = pd.DataFrame({"extra": ["value"]})
    # Patch improved_df_parsing (imported in base.py) to return our dummy enrichment.
    monkeypatch.setattr("base.improved_df_parsing", lambda metadata: dummy_enrichment)
    enriched = client_base.enrich_metadata(df)
    assert "extra" in enriched.columns
    assert enriched["extra"].iloc[0] == "value"
    # Also, check that the repository mapping is added.
    assert "repo" in enriched.columns
    assert enriched["repo"].iloc[0] == "Provider1"

def test_get_contentproviders(client_base, monkeypatch):
    # Patch subprocess.Popen in get_contentproviders to simulate a dummy run.
    class DummyProcessCP:
        def __init__(self, stdout, stderr):
            self._stdout = stdout
            self._stderr = stderr
        def communicate(self, input=None):
            return (self._stdout, self._stderr)

    def dummy_popen_cp(cmd, stdin, stdout, stderr, encoding):
        dummy_stdout = json.dumps([{"name": "cp1", "internal_name": "Provider1"}]) + "\n"
        return DummyProcessCP(dummy_stdout, "")

    monkeypatch.setattr(subprocess, "Popen", dummy_popen_cp)
    res = client_base.get_contentproviders()
    cp_list = json.loads(res["contentproviders"])
    assert isinstance(cp_list, list)
    assert cp_list[0]["name"] == "cp1"
    assert cp_list[0]["internal_name"] == "Provider1"

def test_fetch_contentprovider_records_parses(client_base):
    # get_contentproviders is stubbed by the fixture to a fixed payload.
    records = client_base._fetch_contentprovider_records()
    assert records == [{"name": "cp1", "internal_name": "Provider1"}]


def test_fetch_contentprovider_records_raises_on_error(client_base):
    client_base.get_contentproviders = lambda: {"status": "error"}
    with pytest.raises(RuntimeError):
        client_base._fetch_contentprovider_records()


# --- Tests for filter_duplicates ---

def test_filter_duplicates_drops_internal_columns():
    """filter_duplicates must remove all working columns from the output."""
    df = pd.DataFrame([
        _make_record("1", doi="doi1", duplicates=""),
        _make_record("2", doi="doi2", duplicates=""),
    ])
    filtered = filter_duplicates(df.copy(), "test_service", _DEFAULT_PARAMS)
    for col in ["doi_duplicate", "link_duplicate", "is_anchor",
                "doi_version", "unversioned_doi", "publisher_doi", "has_relations"]:
        assert col not in filtered.columns, f"Column {col!r} should have been dropped"


def test_filter_duplicates_removes_exact_id_duplicates():
    """Records sharing the same id must be deduplicated to one."""
    df = pd.DataFrame([
        _make_record("1", title="Paper A"),
        _make_record("1", title="Paper A copy"),
        _make_record("2", title="Paper B"),
    ])
    filtered = filter_duplicates(df.copy(), "test_service", _DEFAULT_PARAMS)
    assert len(filtered) == 2
    assert set(filtered["id"]) == {"1", "2"}


def test_filter_duplicates_keeps_unique_records():
    """Records that are genuinely unique must all survive."""
    df = pd.DataFrame([
        _make_record("1", doi="10.1/a"),
        _make_record("2", doi="10.1/b"),
        _make_record("3", doi="10.1/c"),
    ])
    filtered = filter_duplicates(df.copy(), "test_service", _DEFAULT_PARAMS)
    assert len(filtered) == 3


def test_filter_duplicates_textual_duplicates_from_duplicates_column():
    """Records listed in each other's duplicates column should collapse to one anchor."""
    # R preprocessing identified "1" and "2" as textual duplicates
    df = pd.DataFrame([
        _make_record("1", duplicates="2", oa_state="0", year="2020"),
        _make_record("2", duplicates="1", oa_state="0", year="2021"),
        _make_record("3", doi="10.1/c"),
    ])
    filtered = filter_duplicates(df.copy(), "test_service", _DEFAULT_PARAMS)
    # Only one of {1, 2} should survive plus record 3
    assert len(filtered) == 2
    ids = set(filtered["id"])
    assert "3" in ids
    assert len(ids & {"1", "2"}) == 1


def test_filter_duplicates_doi_duplicates_resolved():
    """Records with the same DOI (but not in duplicates column) should yield one anchor.

    This tests the add_false_negatives → prioritize path for doi-only duplicates
    that the R script did not mark as textual duplicates.
    """
    df = pd.DataFrame([
        _make_record("1", doi="10.1234/test", duplicates="", oa_state="1", year="2022"),
        _make_record("2", doi="10.1234/test", duplicates="", oa_state="0", year="2020"),
        _make_record("3", doi="10.1234/other"),
    ])
    filtered = filter_duplicates(df.copy(), "test_service", _DEFAULT_PARAMS)
    # Exactly one of {1, 2} should survive
    doi_test_survivors = filtered[filtered["doi"] == "10.1234/test"]
    assert len(doi_test_survivors) == 1, (
        f"Expected 1 anchor for doi 10.1234/test, got {len(doi_test_survivors)}: "
        f"{doi_test_survivors['id'].tolist()}"
    )


def test_filter_duplicates_mixed_type_duplicates_no_double_anchor():
    """A dataset (typenorm=7) and a non-dataset that are textual duplicates must not
    both appear in the output: the split into pure_datasets/non_datasets must not
    accidentally give each sub-group an independent anchor."""
    df = pd.DataFrame([
        _make_record("dataset-A", typenorm="7", duplicates="non-dataset-B",
                     doi="10.1/x", oa_state="0", year="2020"),
        _make_record("non-dataset-B", typenorm="1", duplicates="dataset-A",
                     doi="10.1/x", oa_state="0", year="2020"),
        _make_record("unrelated-C", doi="10.1/c"),
    ])
    filtered = filter_duplicates(df.copy(), "test_service", _DEFAULT_PARAMS)
    ids = set(filtered["id"])
    assert "unrelated-C" in ids
    duplicate_pair_survivors = ids & {"dataset-A", "non-dataset-B"}
    assert len(duplicate_pair_survivors) == 1, (
        f"Both members of a duplicate pair survived: {duplicate_pair_survivors}"
    )


def test_filter_duplicates_oa_preferred_over_non_oa():
    """When prioritizing within a duplicate group, the OA record should be the anchor."""
    df = pd.DataFrame([
        _make_record("oa-version", duplicates="closed-version", oa_state="1", year="2020"),
        _make_record("closed-version", duplicates="oa-version", oa_state="0", year="2021"),
    ])
    filtered = filter_duplicates(df.copy(), "test_service", _DEFAULT_PARAMS)
    assert len(filtered) == 1
    assert filtered.iloc[0]["id"] == "oa-version"


def test_filter_duplicates_latest_year_preferred_when_no_oa():
    """When no OA record exists, the newest record should be the anchor."""
    df = pd.DataFrame([
        _make_record("old", duplicates="new", oa_state="0", year="2018"),
        _make_record("new", duplicates="old", oa_state="0", year="2022"),
    ])
    filtered = filter_duplicates(df.copy(), "test_service", _DEFAULT_PARAMS)
    assert len(filtered) == 1
    assert filtered.iloc[0]["id"] == "new"


# --- Tests for parser functions ---

def test_parse_annotations_for_all():
    # Create a dummy DataFrame with annotation strings.
    df = pd.DataFrame({"subject_orig": ["Type:Example;Other:Value;"]})
    parsed = parse_annotations_for_all(df, "subject_orig")
    assert "annotations" in parsed.columns
    annotations = parsed["annotations"].iloc[0]
    assert isinstance(annotations, dict)
    # Expect that the key "Type" is extracted.
    assert annotations.get("Type") == "Example"

def test_sanitize_authors():
    # Test the author sanitizer: with a list of authors, if n is specified, it should keep first n-1 and the last.
    authors = "John Doe; Jane Smith; Bob Johnson; Alice Williams"
    sanitized = sanitize_authors(authors, n=3)
    parts = authors.split("; ")
    expected = "; ".join(parts[:2] + [parts[-1]])
    assert sanitized == expected
