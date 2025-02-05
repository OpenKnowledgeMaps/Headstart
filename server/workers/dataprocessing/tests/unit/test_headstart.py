import os
import json
import copy
import subprocess
import time
import pytest
import pandas as pd
from io import StringIO

from headstart import Dataprocessing
from streamgraph import Streamgraph

# --- Dummy implementations for dependencies ---

class DummyRedis:
    def __init__(self):
        self.data = {}
        self.queue = []
    def blpop(self, key):
        if self.queue:
            return (key, self.queue.pop(0))
        else:
            raise Exception("Queue empty")
    def set(self, key, value):
        self.data[key] = value
    def ping(self):
        return True

class DummyLogger:
    def debug(self, msg):
        pass
    def error(self, msg):
        pass
    def exception(self, msg):
        pass

# A dummy version of subprocess.Popen that returns controlled output.
class DummyProcess:
    def __init__(self, stdout, stderr):
        self._stdout = stdout
        self._stderr = stderr
    def communicate(self, input=None):
        return (self._stdout, self._stderr)

# --- Fixtures ---

@pytest.fixture
def dummy_redis():
    return DummyRedis()

@pytest.fixture
def dataprocessing_client(dummy_redis, monkeypatch):
    # To avoid issues in __init__, override get_contentproviders to return a dummy list.
    def dummy_get_contentproviders():
        return {"contentproviders": json.dumps([{"name": "cp1", "internal_name": "DummyProvider"}])}
    
    # Create an instance of Dataprocessing with dummy parameters.
    dp = Dataprocessing(wd="./dummy", script="dummy_script.R", redis_store=dummy_redis,
                        language="english", loglevel="DEBUG")
    monkeypatch.setattr(dp, "get_contentproviders", dummy_get_contentproviders)
    # Re-run initialization logic if needed.
    dp.__init__(dp.wd, "dummy_script.R", dummy_redis, "english", "DEBUG")
    return dp

# --- Tests for helper methods ---

def test_add_default_params(dataprocessing_client):
    dp = dataprocessing_client
    # Provide a minimal params dict.
    params = {"q": "test", "custom": "value"}
    merged = dp.add_default_params(params)
    # Check that defaults are present.
    assert merged["MAX_CLUSTERS"] == 15
    assert merged["language"] == "english"
    assert merged["taxonomy_separator"] == ";"
    assert merged["list_size"] == -1
    # And that provided values are kept.
    assert merged["q"] == "test"
    assert merged["custom"] == "value"

def test_next_item(dataprocessing_client, dummy_redis):
    dp = dataprocessing_client
    # Prepare a dummy message and push it into the dummy Redis queue.
    message = {
        "id": "req123",
        "params": {"q": "search term"},
        "input_data": "dummy input",
        "author": "test author"
    }
    dummy_redis.queue.append(json.dumps(message).encode("utf-8"))
    req_id, params, input_data, author = dp.next_item()
    assert req_id == "req123"
    # The returned params should have been merged with defaults.
    assert params["q"] == "search term"
    assert params["MAX_CLUSTERS"] == 15
    assert input_data == "dummy input"
    assert author == "test author"

def test_execute_search(dataprocessing_client, monkeypatch):
    dp = dataprocessing_client
    # Prepare dummy parameters and input data.
    params = {"q": "dummy query", "service": "dataprocessing", "list_size": 100}
    input_data = "dummy input"
    
    # Patch subprocess.Popen to simulate a process returning controlled output.
    def dummy_popen(cmd, stdin, stdout, stderr, encoding):
        # We simulate stdout with several lines;
        # the second-to-last non-empty line is valid JSON representing a list of rows.
        dummy_row = {
            "id": "row1",
            "title": "Test Title",
            "paper_abstract": "Abstract",
            "subject_orig": "Subject",
            "published_in": "Journal",
            "sanitized_authors": "Author"
        }
        dummy_stdout = "header line\n" + json.dumps([dummy_row]) + "\nfooter line\n"
        dummy_stderr = ""
        return DummyProcess(dummy_stdout, dummy_stderr)
    
    monkeypatch.setattr(subprocess, "Popen", dummy_popen)
    # Patch functions called inside execute_search to bypass extra processing.
    monkeypatch.setattr(dp, "sanitize_metadata", lambda df: df)
    monkeypatch.setattr("headstart.filter_duplicates", lambda df: df)
    monkeypatch.setattr("headstart.parse_annotations_for_all",
                        lambda metadata, field: pd.DataFrame({"annotations": [{}]*len(metadata)}))
    monkeypatch.setattr(dp, "enrich_metadata", lambda df: pd.concat(
        [df, pd.DataFrame({"enriched": ["yes"] * len(df)})], axis=1))
    
    res = dp.execute_search(params, input_data)
    # Expected: pd.DataFrame([dummy_row]).to_json(orient="records")
    expected = pd.DataFrame([{
        "id": "row1",
        "title": "Test Title",
        "paper_abstract": "Abstract",
        "subject_orig": "Subject",
        "published_in": "Journal",
        "sanitized_authors": "Author"
    }]).to_json(orient="records")
    assert res == expected

# --- Tests for the run method (timeline branch) ---
# We simulate one iteration of the loop for vis_type "timeline".
def test_run_timeline(dataprocessing_client, dummy_redis, monkeypatch):
    dp = dataprocessing_client
    # Patch next_item to return fixed values.
    def fake_next_item():
        return ("req_run", {"q": "test", "vis_type": "timeline", "top_n": 5, "sg_method": "count", "list_size": 100}, "dummy input", "author")
    monkeypatch.setattr(dp, "next_item", fake_next_item)
    
    # Patch execute_search to return dummy metadata.
    dummy_metadata = pd.DataFrame([{"a": 1}]).to_json(orient="records")
    monkeypatch.setattr(dp, "execute_search", lambda params, inp: dummy_metadata)
    
    # Create a dummy Streamgraph with the two required methods.
    class DummySG:
        def get_streamgraph_data(self, metadata, q, top_n, sg_method):
            return {"dummy_sg": True}
        def reduce_metadata_set(self, metadata, sg_data):
            return {"reduced": True}
    # Patch the global sg variable used in run().
    import headstart as headstart_module
    monkeypatch.setattr(headstart_module, "sg", DummySG())
    
    # To break out of the infinite loop, simulate one iteration manually.
    # Patch rate_limiter.rate_limit_reached to always return False.
    monkeypatch.setattr(dp.rate_limiter, "rate_limit_reached", lambda: False)
    
    # Patch next_item to return a fixed tuple and then raise an exception to exit the loop.
    call_count = [0]
    def fake_next_item_once():
        if call_count[0] == 0:
            call_count[0] += 1
            return ("req_run", {"q": "test", "vis_type": "timeline", "top_n": 5, "sg_method": "count", "list_size": 100}, "dummy input", "author")
        else:
            raise KeyboardInterrupt("Stop run loop")
    monkeyatch.setattr(dp, "next_item", fake_next_item_once)
    
    # Capture output written to Redis.
    outputs = {}
    def dummy_set(key, value):
        outputs[key] = value
    dummy_redis.set = dummy_set
    
    with pytest.raises(KeyboardInterrupt):
        dp.run()
    
    # Check that an output has been set.
    assert "req_run_output" in outputs
    out = json.loads(outputs["req_run_output"])
    assert out["status"] == "success"
    assert "data" in out
    assert "streamgraph" in out