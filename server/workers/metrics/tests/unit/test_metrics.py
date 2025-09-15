import time
import json
import subprocess
import logging
from io import StringIO
import pytest

from metrics import MetricsClient

# --- Dummy Classes and Helpers ---

class DummyRedis:
    def __init__(self):
        self.queue = []
        self.store = {}
    def blpop(self, key):
        if self.queue:
            return (key, self.queue.pop(0))
        else:
            raise Exception("Queue empty")
    def set(self, key, value):
        self.store[key] = value
    def ping(self):
        return True

class DummyRateLimiter:
    def rate_limit_reached(self):
        return False

class DummyLogger:
    def debug(self, msg):
        pass
    def error(self, msg):
        pass
    def exception(self, msg):
        pass

# A dummy RWrapper base that provides the required attributes and a default add_default_params.
class DummyRWrapper:
    def __init__(self, *args):
        self.redis_store = None
        self.command = "Rscript"
        self.runner = "dummy_runner.R"
        self.wd = "/dummy/wd"
        self.logger = DummyLogger()
    def add_default_params(self, params):
        defaults = {"default": "value"}
        if params:
            defaults.update(params)
        return defaults

# Create a testing subclass of MetricsClient that also inherits from DummyRWrapper.
class TestMetricsClient(MetricsClient, DummyRWrapper):
    def __init__(self, redis_store):
        # Initialize DummyRWrapper first.
        DummyRWrapper.__init__(self)
        self.redis_store = redis_store
        # Then initialize MetricsClient.
        MetricsClient.__init__(self)
        # Override the rate_limiter with a dummy one.
        self.rate_limiter = DummyRateLimiter()

# A dummy process to simulate subprocess.Popen output.
class DummyProcess:
    def __init__(self, stdout, stderr):
        self._stdout = stdout
        self._stderr = stderr
    def communicate(self, input=None):
        return (self._stdout, self._stderr)

# --- Tests ---

def test_next_item():
    dummy_redis = DummyRedis()
    # Create a dummy message for the metrics queue.
    message = {
        "id": "item123",
        "params": {"q": "test query", "service": "metrics"},
        "metadata": "dummy metadata"
    }
    dummy_redis.queue.append(json.dumps(message).encode("utf-8"))
    client = TestMetricsClient(dummy_redis)
    item_id, params, metadata = client.next_item()
    assert item_id == "item123"
    # add_default_params should merge in defaults.
    assert params["default"] == "value"
    assert params["q"] == "test query"
    assert metadata == "dummy metadata"

def test_execute_search_success(monkeypatch):
    dummy_redis = DummyRedis()
    client = TestMetricsClient(dummy_redis)
    params = {"q": "test query", "service": "metrics"}
    metadata = "dummy metadata"
    
    # Prepare dummy subprocess output.
    # We need at least two non-empty lines; output[-2] is parsed.
    dummy_result = {"result": "search output"}
    dummy_stdout = "header line\n" + json.dumps(dummy_result) + "\nfooter line\n"
    dummy_stderr = ""
    
    def dummy_popen(cmd, stdin, stdout, stderr, encoding):
        return DummyProcess(dummy_stdout, dummy_stderr)
    
    monkeypatch.setattr(subprocess, "Popen", dummy_popen)
    
    result = client.execute_search(params, metadata)
    # Expect the returned dict to have the dummy_result and the original params.
    assert result["input_data"] == dummy_result
    assert result["params"] == params

def test_execute_search_no_output(monkeypatch):
    dummy_redis = DummyRedis()
    client = TestMetricsClient(dummy_redis)
    params = {"q": "test query", "service": "metrics"}
    metadata = "dummy metadata"
    
    def dummy_popen(cmd, stdin, stdout, stderr, encoding):
        return DummyProcess("", "")
    
    monkeypatch.setattr(subprocess, "Popen", dummy_popen)
    with pytest.raises(ValueError, match="No output received from the subprocess"):
        client.execute_search(params, metadata)

def test_run(monkeypatch):
    dummy_redis = DummyRedis()
    client = TestMetricsClient(dummy_redis)
    
    # Patch next_item to return a fixed tuple and then raise KeyboardInterrupt to exit the infinite loop.
    call_count = [0]
    def fake_next_item():
        if call_count[0] == 0:
            call_count[0] += 1
            return ("item_run", {"q": "run query", "service": "metrics"}, "dummy metadata")
        else:
            raise KeyboardInterrupt("Stop loop")
    monkeypatch.setattr(client, "next_item", fake_next_item)
    
    # Patch execute_search to return a dummy result.
    client.execute_search = lambda params, meta: {"input_data": "search result", "params": params}
    
    # Capture redis output by patching set.
    outputs = {}
    def dummy_set(key, value):
        outputs[key] = value
    dummy_redis.set = dummy_set
    
    with pytest.raises(KeyboardInterrupt):
        client.run()
    
    # Verify that the output for the processed item is stored.
    expected_key = "item_run_output"
    assert expected_key in outputs
    stored = json.loads(outputs[expected_key])
    assert stored["id"] == "item_run"
    assert stored["input_data"] == "search result"
    assert stored["params"]["q"] == "run query"