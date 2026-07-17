import re
import os
import json
import time
import uuid
import redis
import pathlib
import logging
import numpy as np
import pandas as pd
from redis.exceptions import LockError
from datetime import timedelta
from dateutil.parser import parse
from typing import Dict, List, Union
from typing_extensions import Literal


redis_config = {
    "host": os.getenv("REDIS_HOST"),
    "port": os.getenv("REDIS_PORT"),
    "db": os.getenv("REDIS_DB"),
    "password": os.getenv("REDIS_PASSWORD"),
    "client_name": "api"
}

print("Connecting to Redis with config: ", redis_config)

redis_store = redis.StrictRedis(**redis_config)

def get_key(store, key, timeout=180):
    wait_s = 1
    max_tries = timeout / wait_s
    tries = 0
    result = {
        "k": key,
        "status": "error",
        "error": "timeout"
    }
    while tries <= max_tries:
        res = store.get(key+"_output")
        if res is None:
            time.sleep(wait_s)
            tries += 1
        else:
            result = json.loads(res.decode('utf-8'))
            store.delete(key)
            store.delete(key+"_output")
            break
    return result


def detect_error(service, error, params):
    code = 500
    reason = []
    # do API specific error heuristics
    if service == "base" and error.startswith("Error in curl::curl_fetch_memory(x$url$url, handle = x$url$handle): Timeout was reached"):
        reason.append('API error: timeout')
    if service == "pubmed" and error.startswith("HTTP failure: 502, bad gateway"):
        reason.append('API error: requested metadata size')
    if service == "pubmed" and error.startswith("HTTP failure: 500"):
        reason.append('API error: PubMed not reachable')
    if not reason and service == 'pubmed' and error.startswith("HTTP failure"):
        reason.append('unexpected PubMed API error')
    # do query related error heuristics
    if not reason:
        query = params.get('q')
        phrasepattern = '"(.*?)"'
        phrases = re.findall(phrasepattern, query)
        if phrases:
            reason.append('too specific')
        elif len(query.split(" ")) < 4:
            reason.append('typo')
            reason.append('too specific')
        else:
            reason.append('query length')
            reason.append('too specific')
        if "to" in params and "from" in params:
            if parse(params.get('to')) - parse(params.get('from')) <= timedelta(days=60):
                reason.append('timeframe too short')
    # if still unknown, return default error
    if not reason:
        reason = ['unexpected data processing error']
    return code, reason


# Shared, cross-worker cache for the BASE content provider list. The list is
# expensive to fetch (external BASE call via an R script), so instead of every
# gunicorn worker / BASE worker fetching its own copy on startup, the first
# process to see a cold cache fetches it under a Redis lock and publishes it for
# all others to reuse. Same lock idiom as common.rate_limiter.RateLimiter.
CONTENTPROVIDER_RECORDS_KEY = "base:contentproviders:records"
CONTENTPROVIDER_LOCK_KEY = "lock:base:contentproviders"
CONTENTPROVIDER_CACHE_TTL = 86400  # seconds (24h)

# All cache-lifecycle lines share this prefix so they can be grepped/counted in
# aggregated logs (e.g. `grep 'contentprovider-cache:'`).
_CP_LOG_PREFIX = "contentprovider-cache:"
_cp_logger = logging.getLogger(__name__)


def _load_bundled_contentprovider_records():
    """Read the content provider list bundled with the package (last-resort fallback)."""
    df = pd.read_json(
        pathlib.Path(__file__).parent.absolute() / "contentproviders.json"
    )
    return df.to_dict(orient="records")


def _read_cached_contentprovider_records(redis_store):
    """Return the cached records list, or None if absent/unreadable."""
    cached = redis_store.get(CONTENTPROVIDER_RECORDS_KEY)
    if cached is None:
        return None
    try:
        return json.loads(cached)
    except (ValueError, TypeError):
        return None


def _poll_cached_contentprovider_records(redis_store, timeout, wait_s=1):
    """Wait for another process to publish the cache, up to `timeout` seconds."""
    tries = 0
    max_tries = timeout / wait_s
    while tries <= max_tries:
        records = _read_cached_contentprovider_records(redis_store)
        if records is not None:
            return records
        time.sleep(wait_s)
        tries += 1
    return None


def get_contentprovider_records(
    redis_store,
    produce_fn,
    ttl=CONTENTPROVIDER_CACHE_TTL,
    blocking_timeout=120,
    lock_timeout=180,
    poll_timeout=120,
    logger=None,
):
    """
    Return the BASE content provider records as a shared, Redis-cached resource.

    The list is fetched at most once per `ttl` window across all workers: the
    first caller to see a cold cache acquires a lock, calls `produce_fn` to fetch
    the records, and stores them in Redis. Concurrent callers either read the
    freshly written key or fall back to the bundled list, so a simultaneous
    restart of many workers triggers a single fetch instead of one per process.

    :param redis_store: Redis client shared across workers.
    :param produce_fn: zero-arg callable returning a list of
        {"name", "internal_name"} records (the expensive fetch).
    :param ttl: cache lifetime in seconds.
    :param logger: logger for the cache-lifecycle trace (defaults to the module
        logger). Pass the caller's logger to surface the lines in its stream.
    :return: list of content provider records.
    """
    log = logger or _cp_logger
    records = _read_cached_contentprovider_records(redis_store)
    if records is not None:
        log.debug("%s served %d records from shared cache", _CP_LOG_PREFIX, len(records))
        return records
    try:
        with redis_store.lock(
            CONTENTPROVIDER_LOCK_KEY,
            timeout=lock_timeout,
            blocking_timeout=blocking_timeout,
        ):
            # Double-checked: another process may have populated the cache while
            # we were waiting for the lock.
            records = _read_cached_contentprovider_records(redis_store)
            if records is not None:
                log.debug("%s served %d records from shared cache (post-lock)",
                          _CP_LOG_PREFIX, len(records))
                return records
            log.debug("%s cold cache, fetching under lock", _CP_LOG_PREFIX)
            records = produce_fn()
            redis_store.set(
                CONTENTPROVIDER_RECORDS_KEY, json.dumps(records), ex=ttl
            )
            log.debug("%s fetched and published %d records (ttl=%ss)",
                      _CP_LOG_PREFIX, len(records), ttl)
            return records
    except LockError:
        # Another process holds the lock and is producing; wait for it to publish
        # the cache before giving up.
        records = _poll_cached_contentprovider_records(redis_store, poll_timeout)
        if records is not None:
            log.debug("%s served %d records published by another process",
                      _CP_LOG_PREFIX, len(records))
            return records
    except Exception:
        # produce_fn failed or Redis is unavailable; fall through to bundled.
        log.warning("%s fetch failed, using bundled fallback", _CP_LOG_PREFIX,
                    exc_info=True)
        records = _load_bundled_contentprovider_records()
        return records
    log.warning("%s no cache published within timeout, using bundled fallback",
                _CP_LOG_PREFIX)
    return _load_bundled_contentprovider_records()


def _fetch_contentprovider_records_via_queue():
    """Produce records by asking a BASE worker over the Redis queue (API side)."""
    k = str(uuid.uuid4())
    d = {"id": k, "params": {}, "endpoint": "contentproviders"}
    redis_store.rpush("base", json.dumps(d))
    result = get_key(redis_store, k, 100)
    if result.get("status") == "error":
        raise RuntimeError("contentproviders queue request returned an error")
    return json.loads(result["contentproviders"])


def get_or_create_contentprovider_lookup(logger=None):
    """
    Build the {internal_name -> human readable name} lookup used by the API to
    resolve the "data provider" label, backed by the shared Redis cache so all
    gunicorn workers reuse a single fetch.

    :param logger: logger for the cache-lifecycle trace (defaults to the module
        logger). The API passes its namespace logger so the state of the
        request/retrieval shows up alongside the other API log lines.
    """
    try:
        records = get_contentprovider_records(
            redis_store, _fetch_contentprovider_records_via_queue, logger=logger
        )
    except Exception:
        records = _load_bundled_contentprovider_records()
    df = pd.DataFrame(records)
    df.set_index("internal_name", inplace=True)
    return df.name.to_dict()

def get_nested_value(data, keys, default=None):
    """
    Recursively retrieves a nested value from a dictionary.

    :param data: Dictionary to retrieve the value from
    :param keys: List of keys to follow in the dictionary
    :param default: Default value to return if any key is not found
    :return: The retrieved value or the default value
    """
    for key in keys:
        if not hasattr(data, 'get'):
            return default
        data = data.get(key)
        if data is None:
            return default
    return data


def push_metadata_to_queue(
    redis_store: redis.Redis,
    params: Dict[str, Union[str, List[str]]],
    metadata: pd.DataFrame,
    source_list: List[str]
) -> str:
    """
    Sending metadata for processing into Redis queue and returning the request_id.

    :param redis_store: Object of the Redis store.
    :param params: Request params.
    :param metadata: DataFrame with default metadata.
    :param source_list: define from which service additional metadata will be received (available values: "crossref", "altmetric").
    :return: request_id for the receiving of the request result.
    """
    # Checks that valid values are specified in the source array
    check_metadata_enrichment_source(source_list)

    # Creates a new unique request identifier that will then be used to retrieve the result
    request_id = str(uuid.uuid4())

    # Specifies from which sources to obtain information
    params["metrics_sources"] = source_list

    # Payload object creation
    task_data = json.dumps({
        "id": request_id,
        "params": params,
        "metadata": metadata.to_json(orient="records"),
    })

    # Pushing request to Redis and returning request id
    redis_store.rpush("metrics", task_data)
    return request_id


def check_metadata_enrichment_source(source_list: List[str]) -> None:
    """
    Checks that valid values are specified in the source array.

    :param source_list: List of sources from where metadata will be enriched.
    :return: None.
    """
    if not all(source in ("crossref", "altmetric") for source in source_list):
        raise ValueError("Source list must contain only 'crossref' or 'altmetric'")


def fetch_enriched_metadata(redis_store: redis.Redis, request_id: str, timeout: int = 600) -> pd.DataFrame:
    """
    Getting enriched metadata from Redis.

    :param redis_store: Object of the Redis store.
    :param request_id: Unique indemnificator of the request.
    :param timeout: Results waiting time (default - 600 seconds).
    :return: Enriched DataFrame with metadata.
    """
    # Getting result of metadata enrichment from Redis
    result = get_key(redis_store, request_id, timeout)
    return pd.DataFrame(result["input_data"])


def get_metadata_columns_for_source(source_list: List[str]) -> List[str]:
    """
    Returning required metadata columns for different sources.

    :param source_list: List of sources from where metadata received.
    :return: array with required metadata columns.
    """
    # Checks that valid values are specified in the source array
    check_metadata_enrichment_source(source_list)

    # Define required metadata columns for different sources and return them
    result = []

    if "crossref" in source_list:
        result.extend(["citation_count"])

    if "altmetric" in source_list:
        result.extend([
            "cited_by_wikipedia_count",
            "cited_by_msm_count",
            "cited_by_policies_count",
            "cited_by_patents_count",
            "cited_by_accounts_count",
            "cited_by_fbwalls_count",
            "cited_by_feeds_count",
            "cited_by_gplus_count",
            "cited_by_rdts_count",
            "cited_by_qna_count",
            "cited_by_tweeters_count",
            "cited_by_videos_count"
        ])

    return result


def ensure_required_columns(metadata: pd.DataFrame, source_list: List[str]) -> pd.DataFrame:
    """
    Checks that all necessary columns are available or adding them with NaN value.

    :param metadata: DataFrame with metadata.
    :param source_list: List of sources from where metadata received.
    :return: Updated DataFrame.
    """
    # Checks that valid values are specified in the source array
    check_metadata_enrichment_source(source_list)

    # Gets metadata columns that must be received from source(-s)
    columns = get_metadata_columns_for_source(source_list)
    for column in columns:
        if column not in metadata.columns:
            metadata[column] = np.NaN

    return metadata


def enrich_metadata(
    redis: redis.Redis,
    params: Dict[str, Union[str, List[str]]],
    metadata: pd.DataFrame,
    source_list: List[str],
) -> pd.DataFrame:
    """
    Enriching metadata - adding information about citations from Redis.

    :param redis: store object of Redis.
    :param params: params of the request.
    :param metadata: DataFrame with default metadata.
    :param source: define from which service additional metadata will be received (available values: "crossref", "altmetric").
    :return: Enriched DataFrame with metadata.
    """
    # Checks that valid values are specified in the source array
    check_metadata_enrichment_source(source_list)

    # Creates a request to metrics for metadata enrichment
    # and returns request_id for receiving the result later
    request_id = push_metadata_to_queue(redis, params, metadata, source_list)

    # Getting the result after metadata enrichment at metrics
    enriched_metadata = fetch_enriched_metadata(redis, request_id)

    # Checks that all necessary columns are available or adding them with NaN value
    enriched_metadata = ensure_required_columns(enriched_metadata, source_list)
    return enriched_metadata