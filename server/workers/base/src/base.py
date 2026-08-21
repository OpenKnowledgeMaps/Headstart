import os
import json
import subprocess
import pandas as pd
import logging
from itertools import combinations
from rapidfuzz import fuzz
from common.r_wrapper import RWrapper
from common.deduplication import (
    find_version_in_doi,
    get_unversioned_doi,
    get_publisher_doi,
    find_duplicate_groups,
    add_doi_keys,
    extend_duplicates_with_doi_groups,
    select_anchor_index,
    mark_duplicate_dois,
    mark_duplicate_links,
    identify_relations,
    remove_false_positives_doi,
    remove_false_positives_link,
    add_false_negatives,
    remove_textual_duplicates_from_different_sources,
    mark_latest_doi,
    prioritize_OA_and_latest,
    prioritize_doi_and_provider,
    get_provider_priority,
    doi_title_filter,
)
from common.enrichment import enrich_anchor_using_duplicates
import re
import time
from parsers import improved_df_parsing

from datetime import datetime
import dateparser
import sys
from typing import Dict
from common.rate_limiter import RateLimiter
from common.utils import get_contentprovider_records

logger = logging.getLogger(__name__)

class BaseClient(RWrapper):
    def __init__(self, *args):
        super().__init__(*args)
        self.rate_limiter = RateLimiter(self.redis_store, "base-ratelimit", 1.5)

        try:
            records = get_contentprovider_records(
                self.redis_store, self._fetch_contentprovider_records,
                logger=self.logger
            )
            df = pd.DataFrame(records)
            df.set_index("name", inplace=True)
            cp_dict = df.internal_name.to_dict()
            self.content_providers = cp_dict
        except Exception as e:
            self.logger.error(e)
            self.content_providers = {}

    def next_item(self):
        _, message = self.redis_store.blpop("base")
        message = json.loads(message.decode("utf-8"))
        request_id = message.get("id")
        params = self.add_default_params(message.get("params"))
        original_service = params.get("original_service")
        params["service"] = "base"
        if original_service:
            params["original_service"] = original_service
        endpoint = message.get("endpoint")
        self.logger.debug(f"Request ID: {request_id}, Params: {params}, Endpoint: {endpoint}")
        return request_id, params, endpoint

    def execute_search(self, params):
        q = params.get("q")
        service = params.get("service")
        original_service = params.get("original_service", service)
        data = {}
        data["params"] = params
        cmd = [self.command, self.runner, self.wd, q, service]
        try:
            proc = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                encoding="utf-8",
            )
            stdout, stderr = proc.communicate(json.dumps(data))
            output = [o for o in stdout.split("\n") if len(o) > 0]
            error = [o for o in stderr.split("\n") if len(o) > 0]
            if error:
                self.logger.error(error)
            raw_metadata = json.loads(output[-2])
            if isinstance(raw_metadata, dict) and raw_metadata.get("status") == "error":
                res = raw_metadata
            else:
                metadata = pd.DataFrame(raw_metadata)
                metadata = self.sanitize_metadata(metadata)
                _dump_full(metadata, params, "base_00_raw_retrieved")
                metadata = filter_duplicates(metadata, original_service, params)
                metadata = pd.concat(
                    [metadata, parse_annotations_for_all(metadata, "subject_orig")],
                    axis=1,
                )
                metadata = metadata.head(params.get("list_size"))
                # Deterministic emission order: the cutoff above selects by
                # BASE's relevance ranking (response order), which is not
                # stable between identical requests. Row order is not a
                # carrier of information. The rank is in the `relevance`
                # column, so the survivors are emitted sorted by id, giving
                # every downstream consumer an order-stable artifact
                # (order-sensitive steps like the label pipeline otherwise
                # inherit the response instability).
                metadata = metadata.sort_values("id")
                metadata.reset_index(inplace=True, drop=True)
                metadata = self.enrich_metadata(metadata)
                custom_clustering = params.get("custom_clustering")
                if "custom_clustering" in params.keys():
                    if custom_clustering not in metadata.columns:
                        text = pd.concat(
                            [
                                metadata.id,
                                metadata["annotations"].map(
                                    lambda x: x.get(custom_clustering, "")
                                ),
                            ],
                            axis=1,
                        )
                    elif custom_clustering in metadata.columns:
                        text = pd.concat(
                            [metadata.id, metadata[custom_clustering]], axis=1
                        )
                    else:
                        raise Exception("Custom clustering metadata not found.")
                else:
                    text = pd.concat(
                        [
                            metadata.id,
                            metadata[
                                [
                                    "title",
                                    "paper_abstract",
                                    "subject_orig",
                                    "published_in",
                                    "sanitized_authors",
                                ]
                            ].apply(lambda x: " ".join(x), axis=1),
                        ],
                        axis=1,
                    )
                text.columns = ["id", "content"]
                # if text.content is a list, force it to be a string
                text.content = text.content.map(
                    lambda x: ", ".join(x) if isinstance(x, list) else x
                )
                # clean up content, start with stripping whitespace
                text.content = text.content.map(lambda x: x.strip())
                _log_dataframe(metadata, params, "metadata_before_return")
                input_data = {}
                input_data["metadata"] = metadata.to_json(orient="records")
                input_data["text"] = text.to_json(orient="records")
                res = {}
                res["input_data"] = input_data
                res["params"] = params
            return res
        except Exception as e:
            self.logger.error(e)
            raise

    def sanitize_metadata(self, metadata):

        metadata["sanitized_authors"] = metadata["authors"].map(
            lambda x: sanitize_authors(x)
        )
        metadata["year"] = metadata["year"].map(lambda x: sanitize_year(x))
        # in anticipation of BASE API returning DOIs in inconsistent cases,
        # we lowercase them here for better deduplication and enrichment
        # metadata["doi"] = metadata["doi"].map(lambda x: x.lower() if type(x) is str else x) 

        return metadata

    def enrich_metadata(self, metadata):
        metadata["repo"] = metadata["content_provider"].map(
            lambda x: self.content_providers.get(x, "")
        )
        enrichment = improved_df_parsing(metadata)
        metadata = pd.concat([metadata, enrichment], axis=1)
        return metadata

    def _fetch_contentprovider_records(self):
        """Run the R fetch and return the parsed list of content provider records."""
        result = self.get_contentproviders()
        if result.get("status") == "error":
            raise RuntimeError("contentproviders fetch returned an error")
        return json.loads(result["contentproviders"])

    def get_contentproviders(self):
        runner = os.path.abspath(os.path.join(self.wd, "run_base_contentproviders.R"))
        cmd = [self.command, runner, self.wd]
        try:
            proc = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                encoding="utf-8",
            )
            stdout, stderr = proc.communicate()
            output = [o for o in stdout.split("\n") if len(o) > 0]
            error = [o for o in stderr.split("\n") if len(o) > 0]
            if error:
                self.logger.error(error)
            raw = json.loads(output[-1])
            if isinstance(raw, dict) and raw.get("status") == "error":
                res = raw
            else:
                contentproviders = pd.DataFrame(raw)
                res = {}
                res["contentproviders"] = contentproviders.to_json(orient="records")
            return res
        except Exception as e:
            self.logger.error(e)
            raise

    def run(self):
        while True:
            while self.rate_limiter.rate_limit_reached():
                self.logger.warning("🛑 Request is limited")
                time.sleep(0.1)
            request_id, params, endpoint = self.next_item()
            self.logger.debug(request_id)
            self.logger.debug(params)
            if endpoint == "search":
                self.handle_search(request_id, params)
            if endpoint == "contentproviders":
                self.handle_contentproviders(request_id, params)
                
    
    def handle_search(self, request_id, params):
        try:
            res = self.execute_search(params)
            res["id"] = request_id
            if res.get("status") == "error" or params.get("raw") is True:
                self.redis_store.set(request_id + "_output", json.dumps(res))
            else:
                self.redis_store.rpush(
                    "input_data", json.dumps(res).encode("utf8")
                )
                q_len = self.redis_store.llen("input_data")
                self.logger.info(
                    "Queue length: %s %d %s" % ("input_data", q_len, request_id)
                )
        except Exception as e:
            self.logger.exception("Exception during data retrieval.")
            self.logger.error(params)
            self.logger.error(e)
    
    def handle_contentproviders(self, request_id, params):
        try:
            res = self.get_contentproviders()
            res["id"] = request_id
            self.redis_store.set(request_id + "_output", json.dumps(res))
        except Exception as e:
            self.logger.exception(
                "Exception during retrieval of contentproviders."
            )
            self.logger.error(params)
            self.logger.error(e)


pattern_annotations = re.compile(r"([A-Za-z]+:[\w'\- ]+);?")


def _log_dedup_state(df, step, params):
    if not logger.isEnabledFor(logging.DEBUG):
        return
    n_dup = int(df["is_duplicate"].sum()) if "is_duplicate" in df.columns else "?"
    n_anchor = int(df["is_anchor"].sum()) if "is_anchor" in df.columns else "?"
    n_doi_dup = int(df["doi_duplicate"].sum()) if "doi_duplicate" in df.columns else "?"
    n_link_dup = int(df["link_duplicate"].sum()) if "link_duplicate" in df.columns else "?"
    # logger.debug(
    #     f"[dedup:{step}] total={len(df)} is_duplicate={n_dup} is_anchor={n_anchor}"
    #     f" doi_duplicate={n_doi_dup} link_duplicate={n_link_dup}"
    # )
    if "id" in df.columns and "is_duplicate" in df.columns:
        dup_ids = df.loc[df["is_duplicate"], "id"].tolist()
        anchor_ids = df.loc[df["is_anchor"], "id"].tolist() if "is_anchor" in df.columns else []
        # logger.debug(f"[dedup:{step}] duplicate_ids={dup_ids}")
        # logger.debug(f"[dedup:{step}] anchor_ids={anchor_ids}")


def _log_group_similarity(df, indexes, group_type, group_key):
    """Log titles, DOIs, and pairwise Levenshtein ratios for one duplicate group."""
    if not logger.isEnabledFor(logging.DEBUG):
        return
    # Intersect with df.index: group members can be dropped by the
    # false-positive DOI/title filter before this log fires.
    present = df.index.intersection(list(indexes))
    if len(present) == 0:
        return
    rows = df.loc[present]
    titles = rows["title"].fillna("").tolist()
    dois = rows["doi"].fillna("").tolist()
    ids = rows["id"].fillna("").tolist()
    logger.debug(f"[dedup:{group_type}] group={group_key!r} size={len(rows)}")
    for i, (rid, doi, title) in enumerate(zip(ids, dois, titles)):
        logger.debug(f"  [{i}] id={rid!r} doi={doi!r} title={title!r}")
    for (i, t1), (j, t2) in combinations(enumerate(titles), 2):
        ratio = fuzz.ratio(t1, t2)
        logger.debug(f"  levenshtein[{i},{j}]={ratio:.1f}")


def filter_duplicates(df, service, params):
    # if logger.isEnabledFor(logging.DEBUG):
    #     logger.debug(f"Filtering duplicates for service: {service}")
    #     logger.debug(f"Initial number of records: {len(df)}")
    #     _log_dataframe(df, params, "initial_records")

    df.drop_duplicates("id", inplace=True, keep="first")
    df["is_anchor"] = False
    df["doi_duplicate"] = False
    df["has_relations"] = False
    df["link_duplicate"] = False
    df["pdf_link_candidates_from_duplicates"] = ""
    df["duplicates"] = df.apply(
        lambda x: ",".join([x["id"], x["duplicates"]])
        if len(x["duplicates"].split(",")) >= 1
        else x["duplicates"],
        axis=1,
    )
    df["doi_version"] = df.doi.map(
        lambda x: find_version_in_doi(x) if type(x) is str else None
    )
    df["unversioned_doi"] = df.doi.map(
        lambda x: get_unversioned_doi(x) if type(x) is str else None
    )
    df["publisher_doi"] = df.doi.map(lambda x: get_publisher_doi(x))
    # DOI merge key: records sharing a normalized DOI (coalesced from
    # doi_merge / additional_dois / doi) join one duplicate group regardless
    # of whether the textual pass linked them.
    df = add_doi_keys(df)
    df = extend_duplicates_with_doi_groups(df)
    duplicate_groups = find_duplicate_groups(df)
    # logger.debug(f"[dedup:find_duplicate_groups] duplicate_groups groups: {len(duplicate_groups)}, multi-member groups: {sum(1 for idx in duplicate_groups if len(idx) > 1)}")
    # for grp_id, idx in duplicate_groups.items():
    #     if len(idx) > 1:
    #         logger.debug(
    #             f"[dedup:position_check] group id={grp_id!r} size={len(idx)} "
    #             f"member_original_indexes={sorted(idx.tolist())}"
    #         )
    df = mark_duplicate_dois(df, column="doi_key")
    df = mark_duplicate_links(df)
    # _log_dedup_state(df, "after_mark_doi_link_duplicates", params)
    df = identify_relations(df)
    df = remove_false_positives_doi(df)
    df = remove_false_positives_link(df)
    # _log_dedup_state(df, "after_remove_false_positives", params)
    df = remove_textual_duplicates_from_different_sources(df, duplicate_groups)
    # _log_dedup_state(df, "after_remove_textual_duplicates", params)
    df = add_false_negatives(df)
    # _log_dedup_state(df, "after_add_false_negatives", params)
    df = mark_latest_doi(df, duplicate_groups)
    # _log_dedup_state(df, "after_mark_latest_doi", params)
    df.loc[df[~df.is_duplicate].index, "is_anchor"] = True
    # _log_dedup_state(df, "after_non_duplicate_anchors", params)

    # X11 guard, scoped to records sharing the same link-derived `doi`: two
    # such records claiming one DOI with unrelated titles are mis-indexed and
    # the non-anchor side is dropped. dcdoi-derived doi_key groups are exempt
    # on purpose: a repository copy asserting the published DOI is trusted
    # even when retitled (preprint renamed at publication), matching the
    # downstream ORCID DOI-merge this grouping replaces.
    false_positive_indexes = []
    for doi_val, grp in df[df["doi_duplicate"]].groupby("doi"):
        if not doi_val or len(grp) < 2:
            continue
        anchors = grp[grp["is_anchor"]]
        anchor_idx = select_anchor_index(anchors if len(anchors) else grp)
        anchor_title = df.at[anchor_idx, "title"]
        for idx in grp.index:
            if idx == anchor_idx:
                continue
            if doi_title_filter(anchor_title, df.at[idx, "title"]):
                false_positive_indexes.append(idx)
                # logger.debug(
                #     f"[dedup:doi_title_filter] dropping false-positive DOI match "
                #     f"doi={doi_val!r} anchor={anchor_title!r} "
                #     f"candidate={df.at[idx, 'title']!r}"
                # )
    if false_positive_indexes:
        df.drop(index=false_positive_indexes, inplace=True)
        logger.info(f"[dedup:doi_title_filter] dropped {len(false_positive_indexes)} false-positive records")

    # if logger.isEnabledFor(logging.DEBUG):
    #     for idx_group in duplicate_groups:
    #         if len(idx_group) > 1:
    #             _log_group_similarity(df, idx_group, "textual_dup_group", group_key="duplicate_groups")
    # if logger.isEnabledFor(logging.DEBUG):
    #     doi_groups = df[df["doi_duplicate"]].groupby("doi")
    #     for doi_val, grp in doi_groups:
    #         if len(grp) > 1:
    #             _log_group_similarity(df, grp.index, "doi_dup_group", group_key=doi_val)

    pure_datasets = df[df.typenorm == "7"]
    non_datasets = df.loc[df.index.difference(pure_datasets.index)]
    # logger.debug(f"[dedup:split] non_datasets={len(non_datasets)} pure_datasets={len(pure_datasets)}")

    # Pre-prioritize snapshot: records in raw pre-tie-break order, with resp_pos /
    # collection / provider_priority, so anchor decisions can be traced.
    _dump_dedup(non_datasets, params, "base_09_non_datasets_pre_prioritize")
    non_datasets = prioritize_OA_and_latest(non_datasets, duplicate_groups)
    non_datasets = prioritize_doi_and_provider(non_datasets, duplicate_groups)
    # _log_dedup_state(non_datasets, "non_datasets_after_prioritize", params)
    pure_datasets = mark_latest_doi(pure_datasets, duplicate_groups)

    pure_datasets_condition_mask = (pure_datasets.is_anchor == True) | (pure_datasets.is_duplicate == False)
    pure_datasets.loc[pure_datasets_condition_mask, "is_anchor"] = True
    # _log_dedup_state(pure_datasets, "pure_datasets_after_mark_latest", params)

    _dump_dedup(non_datasets, params, "base_10_non_datasets_pre_enrich")
    _dump_dedup(pure_datasets, params, "base_11_pure_datasets_pre_enrich")
    non_datasets = enrich_anchor_using_duplicates(non_datasets, duplicate_groups)
    pure_datasets = enrich_anchor_using_duplicates(pure_datasets, duplicate_groups)
    _dump_dedup(non_datasets, params, "base_12_non_datasets_post_enrich")
    _dump_dedup(pure_datasets, params, "base_13_pure_datasets_post_enrich")

    filtered_non_datasets = non_datasets[non_datasets.is_anchor == True]
    filtered_datasets = pure_datasets[pure_datasets.is_anchor == True]
    filtered = pd.concat([filtered_non_datasets, filtered_datasets])

    # For each duplicate group whose anchor ended up at a higher index than
    # another group member (which was dropped as non-anchor), move the anchor
    # to the best-ranked (lowest) index in the group so it survives head(list_size).
    seen_groups = set()
    claimed_targets = set()
    index_renames = {}
    for _grp_id, idx in duplicate_groups.items():
        if len(idx) <= 1:
            continue
        idx_key = frozenset(idx.tolist())
        if idx_key in seen_groups:
            continue
        seen_groups.add(idx_key)
        anchor_idxs = filtered.index.intersection(idx)
        if len(anchor_idxs) == 0:
            continue
        min_idx = min(idx.tolist())
        if min_idx in filtered.index or min_idx in claimed_targets:
            continue
        for anchor_idx in sorted(anchor_idxs):
            if anchor_idx > min_idx:
                index_renames[anchor_idx] = min_idx
                claimed_targets.add(min_idx)
                break
    if index_renames:
        filtered.rename(index=index_renames, inplace=True)
        logger.info(f"[dedup:index_fix] moved {len(index_renames)} anchor(s) to best-ranked group position: {index_renames}")

    filtered.sort_index(inplace=True)

    list_size = params.get("list_size")
    for rank, (orig_idx, row) in enumerate(filtered.iterrows()):
        beyond = list_size is not None and rank >= list_size
        # logger.debug(
        #     f"[dedup:position_check] anchor id={row['id']!r} "
        #     f"original_index={orig_idx} filtered_rank={rank} "
        #     f"beyond_list_size={beyond} list_size={list_size}"
        # )

    for c in [
        "doi_duplicate",
        "link_duplicate",
        "is_anchor",
        "duplicates",
        "doi_version",
        "unversioned_doi",
        "publisher_doi",
        "doi_key",
        "has_relations",
        "versions",
    ]:
        if c in filtered.columns:
            filtered.drop(c, axis=1, inplace=True)

    # if logger.isEnabledFor(logging.DEBUG):
    #     logger.debug(f"Number of records after filtering: {len(filtered)}")
    #     _log_dataframe(filtered, params, "filtered_records")
    return filtered


def parse_annotations(field):
    if type(field) is str:
        try:
            # keep only first annotation of each type
            matches = pattern_annotations.findall(field)
            matches = [{m.split(":")[0]: m.split(":")[1]} for m in matches]
            annotations = pd.DataFrame(matches)
            annotations = annotations.fillna(method="backfill").head(1).T[0]
            return annotations.to_dict()
        except Exception as e:
            return {}
    else:
        return {}




def parse_annotations_for_all(metadata, field_name):
    parsed_annotations = pd.DataFrame(
        metadata[field_name].map(lambda x: parse_annotations(x))
    )
    parsed_annotations.columns = ["annotations"]
    return parsed_annotations


def clean_up_annotations(df, field):
    df[field] = df[field].map(lambda x: pattern_annotations.sub("", x).strip())
    return df


def sanitize_authors(authors, n=15):
    authors = authors.split("; ")
    if len(authors) > n:
        authors = authors[: n - 1] + authors[-1:]
    return "; ".join(authors)


def sanitize_year(year_str):

    sanitized_year = ''
    date_formats = ["%Y-%m-%d", "%Y-%m", "%Y-%m-%dT%H:%M:%SZ", "%Y %b %d"]

    for fmt in date_formats:
        try:
            #date_time_obj = datetime.strptime(year_str, fmt)
            dateparser.parse(year_str)
            sanitized_year = year_str  # here we keep the original string
            break
        except ValueError:
            continue

    # Handle formats like "2019"
    if year_str.isdigit() and not sanitized_year:  # check sanitized_year to avoid overwriting
        sanitized_year = year_str  # here we keep the original string

    return sanitized_year

def _dump_dedup(df: pd.DataFrame, params: Dict[str, str], name: str):
    """Debug dump of a dedup/anchor stage to ./output/<vis_id>/<name>.csv.

    Captures the anchor-deciding columns (is_anchor/is_duplicate/oa_state/content_provider/
    collection/provider_priority) and the fields that survive into clustering content
    (subject_orig/paper_abstract), plus `resp_pos` = the row's original BASE response
    position. Keyed on the BASE request vis_id; correlate to the map via paper `id`.

    The full DOI provenance is logged so anchor grouping can be assessed against
    every field a DOI may live in: `doi`/`doi_merge` derive from `find_dois(link)`,
    while `additional_dois` carries the raw `dcdoi` values. `doi_key` is the
    normalized grouping key coalesced from those fields (see compute_doi_key).
    DEBUG-gated, non-fatal. Traceability of the metadata transformations in dedup.
    """
    if not logger.isEnabledFor(logging.DEBUG):
        return
    try:
        vis_id = params.get('vis_id')
        out = df.copy()
        out['resp_pos'] = out.index
        if 'collection' in out.columns:
            out['provider_priority'] = out['collection'].map(get_provider_priority)
        cols = ['resp_pos', 'id', 'doi', 'doi_merge', 'additional_dois',
                'doi_key', 'collection', 'provider_priority', 'content_provider',
                'is_anchor', 'is_duplicate', 'oa_state', 'year',
                'link', 'subject_orig', 'paper_abstract', 'title']
        cols = [c for c in cols if c in out.columns]
        folder = f'./output/{vis_id}'
        os.makedirs(folder, exist_ok=True)
        out.reindex(columns=cols).fillna('missing').to_csv(f'{folder}/{name}.csv', index=False)
    except Exception as e:
        logger.warning(f"_dump_dedup failed for {name}: {e}")


def _dump_full(df: pd.DataFrame, params: Dict[str, str], name: str):
    """Debug dump of the initial-retrieval records with ALL columns.

    Unlike `_dump_dedup` (a curated column subset), this captures every field
    base.R populates so a DOI can be traced in any field it may occur in: not
    just `doi`/`doi_merge`/`additional_dois`, but also `relation` (dcrelation),
    `identifier` (dcidentifier), `published_in` (dcsource), `coverage`, etc.
    Written before deduplication, so it reflects the raw BASE response pool.
    `resp_pos` = the row's original BASE response position. Keyed on the BASE
    request vis_id. DEBUG-gated, non-fatal.
    """
    if not logger.isEnabledFor(logging.DEBUG):
        return
    try:
        vis_id = params.get('vis_id')
        out = df.copy()
        out['resp_pos'] = out.index
        front = [c for c in ['resp_pos', 'id'] if c in out.columns]
        cols = front + [c for c in out.columns if c not in front]
        folder = f'./output/{vis_id}'
        os.makedirs(folder, exist_ok=True)
        out.reindex(columns=cols).fillna('missing').to_csv(f'{folder}/{name}.csv', index=False)
    except Exception as e:
        logger.warning(f"_dump_full failed for {name}: {e}")


def _log_dataframe(df: pd.DataFrame, params: Dict[str, str], name: str, ):
    vis_id = params.get('vis_id')

    columns_to_print = ['id', 'title', 'doi', 'doi_merge', 'additional_dois', 'paper_abstract', 'link', 'subject', 'subject_orig', 'oa_state']

    available_columns = df.columns.tolist()
    columns_to_print = [col for col in columns_to_print if col in available_columns]

    transformed = df.copy().reindex(columns=columns_to_print)
    
    transformed = transformed.fillna(value='missing')
    
    # create folder
    folder = f'./output/{vis_id}'
    if not os.path.exists(folder):
        os.makedirs(folder)
    file_path = f"{folder}/{name}.csv"
    transformed.to_csv(file_path, index=False)