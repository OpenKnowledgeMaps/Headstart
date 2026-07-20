import json
import time
import threading
from contextlib import contextmanager

import pytest
from redis.exceptions import LockError

import common.utils as cu
from common.utils import (
    get_contentprovider_records,
    get_or_create_contentprovider_lookup,
    CONTENTPROVIDER_RECORDS_KEY,
)

RECORDS = [
    {"name": "Université de Lausanne", "internal_name": "ftunivlausanne"},
    {"name": "Some Repo", "internal_name": "ftsomerepo"},
]


# --- Minimal in-memory Redis double supporting get / set(ex) / lock -----------

class FakeRedis:
    def __init__(self, fail_lock=False):
        self.store = {}
        self.last_ex = None
        self._fail_lock = fail_lock
        self._lock = threading.Lock()

    def get(self, key):
        return self.store.get(key)

    def set(self, key, value, ex=None):
        self.store[key] = value
        self.last_ex = ex

    @contextmanager
    def lock(self, name, timeout=None, blocking_timeout=None):
        if self._fail_lock:
            raise LockError("could not acquire lock")
        acquired = self._lock.acquire(
            timeout=blocking_timeout if blocking_timeout is not None else -1
        )
        if not acquired:
            raise LockError("lock acquisition timed out")
        try:
            yield
        finally:
            self._lock.release()


# --- get_contentprovider_records ---------------------------------------------

def test_cache_hit_skips_producer():
    r = FakeRedis()
    r.set(CONTENTPROVIDER_RECORDS_KEY, json.dumps(RECORDS))
    calls = []

    out = get_contentprovider_records(r, lambda: calls.append(1) or [])

    assert out == RECORDS
    assert calls == []  # producer never called on a warm cache


def test_cache_miss_produces_and_caches_with_ttl():
    r = FakeRedis()
    calls = []

    def produce():
        calls.append(1)
        return RECORDS

    out = get_contentprovider_records(r, produce, ttl=1234)

    assert out == RECORDS
    assert calls == [1]
    assert json.loads(r.store[CONTENTPROVIDER_RECORDS_KEY]) == RECORDS
    assert r.last_ex == 1234


def test_single_producer_under_contention():
    r = FakeRedis()
    counter = {"n": 0}
    counter_lock = threading.Lock()

    def produce():
        with counter_lock:
            counter["n"] += 1
        time.sleep(0.2)  # hold the lock long enough for others to contend
        return RECORDS

    results = []

    def worker():
        results.append(get_contentprovider_records(r, produce))

    threads = [threading.Thread(target=worker) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert counter["n"] == 1  # exactly one fetch despite 5 concurrent callers
    assert all(res == RECORDS for res in results)


def test_lock_contention_waits_for_published_cache():
    r = FakeRedis(fail_lock=True)  # this caller can never acquire the lock

    def publish_later():
        time.sleep(0.1)
        r.set(CONTENTPROVIDER_RECORDS_KEY, json.dumps(RECORDS))

    t = threading.Thread(target=publish_later)
    t.start()

    def produce_should_not_run():
        raise AssertionError("producer must not run when the lock is held elsewhere")

    out = get_contentprovider_records(r, produce_should_not_run, poll_timeout=5)
    t.join()

    assert out == RECORDS


def test_producer_error_falls_back_to_bundled():
    r = FakeRedis()

    def produce():
        raise RuntimeError("boom")

    out = get_contentprovider_records(r, produce)

    assert isinstance(out, list) and len(out) > 0
    assert {"name", "internal_name"} <= set(out[0].keys())


def test_corrupt_cache_value_is_reproduced():
    r = FakeRedis()
    r.set(CONTENTPROVIDER_RECORDS_KEY, "not-json{")

    out = get_contentprovider_records(r, lambda: RECORDS)

    assert out == RECORDS


def test_cache_hit_logs_debug_trace(caplog):
    r = FakeRedis()
    r.set(CONTENTPROVIDER_RECORDS_KEY, json.dumps(RECORDS))

    with caplog.at_level("DEBUG"):
        get_contentprovider_records(r, lambda: [])

    assert any(
        "contentprovider-cache: served" in rec.message for rec in caplog.records
    )


def test_fallback_logs_warning(caplog):
    r = FakeRedis()

    def produce():
        raise RuntimeError("boom")

    with caplog.at_level("WARNING"):
        get_contentprovider_records(r, produce)

    assert any(
        rec.levelname == "WARNING" and "bundled fallback" in rec.message
        for rec in caplog.records
    )


# --- get_or_create_contentprovider_lookup (API forward map) ------------------

def test_get_or_create_builds_forward_lookup(monkeypatch):
    monkeypatch.setattr(
        cu, "get_contentprovider_records", lambda store, fn, **kw: RECORDS
    )

    lookup = get_or_create_contentprovider_lookup()

    assert lookup == {
        "ftunivlausanne": "Université de Lausanne",
        "ftsomerepo": "Some Repo",
    }
