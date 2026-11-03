"""Queue timing instrumentation shared by the API and the workers.

Every task that travels over a Redis queue carries two timestamps:

  enqueued_at   set by the producer right before ``rpush``
  dequeued_at   set by the consumer right after ``blpop``

The consumer derives ``time_on_queue`` from the two and logs it together with
the task ``endpoint``, the map ``vis_id`` (from the task params) and the task
``id``. The API logs the total backend time of a request from the enqueue to
the arrival of the result.

A worker that enqueues sub-tasks for a map it is building (the ORCID worker's
BASE lookups, for example) gives each sub-task its own ``vis_id`` in the
params. Such a sub-task carries the map it belongs to in ``origin_vis_id`` at
the top level of the task dict, and the log line repeats it so the sub-task
can be tied back to the map.

Timestamps are Unix epoch seconds (``time.time()``). The log lines use a
``key=value`` layout so they can be grepped and turned into metrics. The
``endpoint`` is always present (``None`` for tasks without one, such as the
``input_data`` queue); ``origin_vis_id`` is appended only when the task has it:

  Time on queue: queue=base endpoint=search time_on_queue=0.412 vis_id=... task_id=...
  Time on queue: queue=base endpoint=search time_on_queue=0.003 vis_id=... task_id=... origin_vis_id=...
  Backend time: queue=base endpoint=search total=23.108 status=ok vis_id=... task_id=...

Worker processes write these lines to stdout and, when ``API_LOGFILE`` is set,
to that file as well. The deployment points it at the API container's log file
so one file holds the queue timing of every service.
"""

import logging
import os
import sys
import time

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOGGER_NAME = "queue_timing"
LOGFILE_ENV = "API_LOGFILE"

_logger = None


def get_logger():
    """Return the shared queue timing logger, creating its handlers on first use."""
    global _logger
    if _logger is not None:
        return _logger
    logger = logging.getLogger(LOGGER_NAME)
    logger.setLevel(logging.INFO)
    # Own handlers only: the root logger of the workers would otherwise print
    # every line a second time.
    logger.propagate = False
    formatter = logging.Formatter(LOG_FORMAT)
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)
    logfile = os.getenv(LOGFILE_ENV)
    if logfile:
        try:
            file_handler = logging.FileHandler(logfile)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        except OSError as e:
            logger.warning("cannot open %s=%s, logging to stdout only: %s",
                           LOGFILE_ENV, logfile, e)
    _logger = logger
    return _logger


def _vis_id(task):
    params = task.get("params") or {}
    if isinstance(params, dict):
        return params.get("vis_id")
    return None


def _task_fields(task):
    """Return the ``key=value`` tail shared by both log lines."""
    fields = "endpoint=%s" % task.get("endpoint")
    ids = "vis_id=%s task_id=%s" % (_vis_id(task), task.get("id"))
    origin = task.get("origin_vis_id")
    if origin is not None:
        ids += " origin_vis_id=%s" % origin
    return fields, ids


def mark_enqueued(task):
    """Stamp ``enqueued_at`` on a task dict about to be pushed to a queue.

    Returns the same dict so the call can wrap the dict literal.
    """
    task["enqueued_at"] = time.time()
    return task


def mark_dequeued(queue, task, logger=None):
    """Stamp ``dequeued_at`` on a task taken from ``queue`` and log its time on queue.

    Tasks from producers that do not set ``enqueued_at`` are stamped but not
    logged. Returns ``time_on_queue`` in seconds, or None when unknown.
    """
    dequeued_at = time.time()
    task["dequeued_at"] = dequeued_at
    enqueued_at = task.get("enqueued_at")
    if not isinstance(enqueued_at, (int, float)):
        return None
    time_on_queue = dequeued_at - enqueued_at
    task["time_on_queue"] = time_on_queue
    endpoint, ids = _task_fields(task)
    (logger or get_logger()).info(
        "Time on queue: queue=%s %s time_on_queue=%.3f %s",
        queue, endpoint, time_on_queue, ids,
    )
    return time_on_queue


def log_backend_time(logger, queue, task, result=None):
    """Log the time from the enqueue of ``task`` until its result arrived.

    ``result`` is whatever ``get_key`` returned; its ``status`` (and ``error``
    on failure) is included so timeouts can be told apart from completed
    requests. Returns the total in seconds, or None if the task was never
    marked as enqueued.
    """
    enqueued_at = task.get("enqueued_at")
    if not isinstance(enqueued_at, (int, float)):
        return None
    total = time.time() - enqueued_at
    status = "ok"
    detail = ""
    if isinstance(result, dict):
        status = result.get("status") or "ok"
        if status == "error":
            detail = " error=%s" % (result.get("error") or result.get("reason"))
    endpoint, ids = _task_fields(task)
    logger.info(
        "Backend time: queue=%s %s total=%.3f status=%s%s %s",
        queue, endpoint, total, status, detail, ids,
    )
    return total
