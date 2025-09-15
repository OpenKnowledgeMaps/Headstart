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
    monkeypatch.setattr("base.filter_duplicates", lambda df: df)
    monkeypatch.setattr("base.parse_annotations_for_all", lambda metadata, field: 
                        pd.DataFrame({"annotations": [{}] * len(metadata)}))
    monkeypatch.setattr(client_base, "enrich_metadata", lambda df: pd.concat(
        [df, pd.DataFrame({"enriched": ["yes"] * len(df)})], axis=1))
    
    params = {"q": "dummy query", "service": "base", "list_size": 100}
    res = client_base.execute_search(params)
    assert isinstance(res, dict)
    assert "input_data" in res
    assert "params" in res

def test_sanitize_metadata(client_base):
    # Create a dummy DataFrame with an "authors" column.
    df = pd.DataFrame({"authors": ["John Doe; Jane Smith"]})
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

# --- Tests for parser functions ---

def test_filter_duplicates():
    # Create a dummy DataFrame simulating duplicate entries.
    df = pd.DataFrame({
        "id": ["1", "1", "2"],  # id as strings
        "duplicates": ["1,1", "1,1", ""],
        "doi": ["doi1", "doi1", "doi2"],
        "typenorm": ["7", "7", "non7"],
        "is_duplicate": [False, False, False],
        "link": ["", "", ""]  # Provide a link column to avoid KeyError
    })
    # Add extra columns that filter_duplicates is supposed to drop.
    df["doi_duplicate"] = False
    df["link_duplicate"] = False
    df["is_latest"] = True
    df["keep"] = False
    df["doi_version"] = ["v1", "v1", "v2"]
    df["unversioned_doi"] = ["doi1", "doi1", "doi2"]
    df["publisher_doi"] = ["pub1", "pub1", "pub2"]
    df["has_relations"] = False
    
    filtered = filter_duplicates(df.copy())
    # Verify that the dropped columns are not present.
    for col in [
        "doi_duplicate", "link_duplicate", "is_latest", "keep",
        "doi_version", "unversioned_doi", "publisher_doi", "has_relations"
    ]:
        assert col not in filtered.columns

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