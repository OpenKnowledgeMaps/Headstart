"""Queue timing stamps and log lines shared by the API and the workers."""

import json
import logging

import pytest

from common import queue_timing
from common.queue_timing import log_backend_time, mark_dequeued, mark_enqueued


@pytest.fixture
def fixed_clock(monkeypatch):
    """Replace time.time() in the module with a controllable clock."""
    now = {"t": 1000.0}
    monkeypatch.setattr(queue_timing.time, "time", lambda: now["t"])
    return now


def test_mark_enqueued_stamps_and_returns_task(fixed_clock):
    task = {"id": "t1", "params": {"vis_id": "v1"}}
    assert mark_enqueued(task) is task
    assert task["enqueued_at"] == 1000.0
    # The stamp survives the JSON round trip through Redis.
    assert json.loads(json.dumps(task))["enqueued_at"] == 1000.0


def test_mark_dequeued_computes_time_on_queue_and_logs(fixed_clock, caplog):
    task = mark_enqueued({"id": "t1", "params": {"vis_id": "v1"}, "endpoint": "search"})
    fixed_clock["t"] = 1002.5
    logger = logging.getLogger("test.queue_timing")
    with caplog.at_level(logging.INFO, logger=logger.name):
        assert mark_dequeued("base", task, logger=logger) == 2.5
    assert task["dequeued_at"] == 1002.5
    assert task["time_on_queue"] == 2.5
    assert caplog.messages == [
        "Time on queue: queue=base endpoint=search time_on_queue=2.500 vis_id=v1 task_id=t1"
    ]


def test_mark_dequeued_logs_endpoint_none_for_forwarded_tasks(fixed_clock, caplog):
    """Results forwarded to input_data carry no endpoint; the key stays in the line."""
    task = mark_enqueued({"id": "t1", "params": {"vis_id": "v1"}, "input_data": "[]"})
    logger = logging.getLogger("test.queue_timing")
    with caplog.at_level(logging.INFO, logger=logger.name):
        mark_dequeued("input_data", task, logger=logger)
    assert caplog.messages == [
        "Time on queue: queue=input_data endpoint=None time_on_queue=0.000 vis_id=v1 task_id=t1"
    ]


def test_mark_dequeued_appends_origin_vis_id_of_sub_tasks(fixed_clock, caplog):
    """A sub-task built for another map names that map at the end of the line."""
    task = mark_enqueued({"id": "t1", "origin_vis_id": "map1",
                          "params": {"vis_id": "t1"}, "endpoint": "search"})
    logger = logging.getLogger("test.queue_timing")
    with caplog.at_level(logging.INFO, logger=logger.name):
        mark_dequeued("base", task, logger=logger)
    assert caplog.messages == [
        "Time on queue: queue=base endpoint=search time_on_queue=0.000 "
        "vis_id=t1 task_id=t1 origin_vis_id=map1"
    ]


def test_origin_vis_id_is_omitted_when_absent_or_none(fixed_clock, caplog):
    logger = logging.getLogger("test.queue_timing")
    with caplog.at_level(logging.INFO, logger=logger.name):
        mark_dequeued("base", mark_enqueued({"id": "t1", "params": {}}), logger=logger)
        mark_dequeued("base", mark_enqueued({"id": "t2", "origin_vis_id": None, "params": {}}),
                      logger=logger)
    assert all("origin_vis_id" not in m for m in caplog.messages)


def test_mark_dequeued_without_enqueue_stamp_is_silent(fixed_clock, caplog):
    """Tasks from producers that predate the stamp are stamped but not logged."""
    task = {"id": "t1", "params": {}}
    logger = logging.getLogger("test.queue_timing")
    with caplog.at_level(logging.INFO, logger=logger.name):
        assert mark_dequeued("base", task, logger=logger) is None
    assert task["dequeued_at"] == 1000.0
    assert "time_on_queue" not in task
    assert caplog.messages == []


def test_mark_dequeued_tolerates_missing_or_non_dict_params(fixed_clock):
    assert mark_dequeued("metrics", mark_enqueued({"id": "t1"})) == 0.0
    assert mark_dequeued("metrics", mark_enqueued({"id": "t2", "params": "x"})) == 0.0


def test_log_backend_time_ok(fixed_clock, caplog):
    task = mark_enqueued({"id": "t1", "params": {"vis_id": "v1"}, "endpoint": "search"})
    fixed_clock["t"] = 1023.108
    logger = logging.getLogger("test.queue_timing")
    with caplog.at_level(logging.INFO, logger=logger.name):
        total = log_backend_time(logger, "base", task, {"documents": "[]"})
    assert total == pytest.approx(23.108)
    assert caplog.messages == [
        "Backend time: queue=base endpoint=search total=23.108 status=ok vis_id=v1 task_id=t1"
    ]


def test_log_backend_time_distinguishes_endpoints_on_one_queue(fixed_clock, caplog):
    """OpenAIRE's project lookup has no vis_id yet; the endpoint tells it apart."""
    task = mark_enqueued({"id": "t1", "params": {"project_id": "710722"},
                          "endpoint": "projectdata"})
    fixed_clock["t"] = 1006.0
    logger = logging.getLogger("test.queue_timing")
    with caplog.at_level(logging.INFO, logger=logger.name):
        log_backend_time(logger, "openaire", task, {"status": "ok"})
    assert caplog.messages == [
        "Backend time: queue=openaire endpoint=projectdata total=6.000 status=ok "
        "vis_id=None task_id=t1"
    ]


def test_log_backend_time_reports_timeout_error(fixed_clock, caplog):
    task = mark_enqueued({"id": "t1", "params": {"vis_id": "v1"}, "endpoint": "search"})
    fixed_clock["t"] = 1300.0
    logger = logging.getLogger("test.queue_timing")
    result = {"k": "t1", "status": "error", "error": "timeout"}
    with caplog.at_level(logging.INFO, logger=logger.name):
        log_backend_time(logger, "pubmed", task, result)
    assert caplog.messages == [
        "Backend time: queue=pubmed endpoint=search total=300.000 status=error error=timeout "
        "vis_id=v1 task_id=t1"
    ]


def test_log_backend_time_accepts_non_dict_result(fixed_clock, caplog):
    task = mark_enqueued({"id": "t1", "params": {}})
    logger = logging.getLogger("test.queue_timing")
    with caplog.at_level(logging.INFO, logger=logger.name):
        assert log_backend_time(logger, "input_data", task, "raw json") == 0.0
    assert "status=ok" in caplog.messages[0]


def test_log_backend_time_without_stamp_is_silent(caplog):
    logger = logging.getLogger("test.queue_timing")
    with caplog.at_level(logging.INFO, logger=logger.name):
        assert log_backend_time(logger, "base", {"id": "t1"}, {}) is None
    assert caplog.messages == []


def test_get_logger_writes_to_api_logfile(tmp_path, monkeypatch):
    logfile = tmp_path / "api.log"
    monkeypatch.setenv(queue_timing.LOGFILE_ENV, str(logfile))
    monkeypatch.setattr(queue_timing, "_logger", None)
    logger = queue_timing.get_logger()
    try:
        mark_dequeued("base", mark_enqueued({"id": "t1", "params": {"vis_id": "v1"}}))
        for handler in logger.handlers:
            handler.flush()
        content = logfile.read_text()
    finally:
        for handler in list(logger.handlers):
            handler.close()
            logger.removeHandler(handler)
        monkeypatch.setattr(queue_timing, "_logger", None)
    assert "Time on queue: queue=base" in content
    assert "vis_id=v1 task_id=t1" in content
    assert " - queue_timing - INFO - " in content


def test_get_logger_falls_back_to_stdout_when_logfile_unwritable(tmp_path, monkeypatch):
    monkeypatch.setenv(queue_timing.LOGFILE_ENV, str(tmp_path / "missing" / "api.log"))
    monkeypatch.setattr(queue_timing, "_logger", None)
    logger = queue_timing.get_logger()
    try:
        assert not any(isinstance(h, logging.FileHandler) for h in logger.handlers)
        assert any(isinstance(h, logging.StreamHandler) for h in logger.handlers)
    finally:
        for handler in list(logger.handlers):
            handler.close()
            logger.removeHandler(handler)
        monkeypatch.setattr(queue_timing, "_logger", None)
