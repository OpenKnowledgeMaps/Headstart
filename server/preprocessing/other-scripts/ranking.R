# ranking.R
# Area-title ranking modes (see docs/area_title_ranking_plan.md).
#
# Stage 0 wiring only: the per-integration config resolver `ranking_mode()` and
# the selection wedge `select_cluster_label_names()`. The wedge is a NO-OP for
# Mode 0 (the unchanged legacy selection) and, until the rank-aware selection
# lands (Stage 1+), falls back to the legacy selection for Modes 1-3 so an early
# config flag can never break labelling.
#
# This file is deliberately pure base R (no packages, no logging) so it can be
# sourced and unit-tested in isolation, mirroring subject_cleaning.R.

RANKING_MODES <- c("0", "1", "2", "3")

# Resolve the ranking mode for a data integration. Precedence:
#   1. per-integration override  RANKING_MODE_<SERVICE>  (e.g. RANKING_MODE_BASE)
#   2. global                    RANKING_MODE
#   3. default                   "0" (legacy)
# A value is only honoured if it is one of RANKING_MODES; an invalid value at one
# level falls through to the next, and if nothing valid is set the function
# returns "0". It warns only when something *was* configured but nothing valid
# resolved, so a misconfiguration degrades safely to legacy instead of breaking.
#   service : integration name (e.g. "base", "pubmed", "orcid", "openaire"); the
#             env var is RANKING_MODE_<toupper(service)>. NULL/"" skips step 1.
ranking_mode <- function(service = NULL) {
  pick <- function(v) if (nzchar(v) && v %in% RANKING_MODES) v else NA_character_

  raw_svc <- if (!is.null(service) && nzchar(service)) {
    Sys.getenv(paste0("RANKING_MODE_", toupper(service)))
  } else {
    ""
  }
  raw_glob <- Sys.getenv("RANKING_MODE")

  mode <- pick(raw_svc)
  if (is.na(mode)) mode <- pick(raw_glob)
  if (!is.na(mode)) return(mode)

  # nothing valid resolved; warn if the user set *something*
  if (nzchar(raw_svc) || nzchar(raw_glob)) {
    msg <- sprintf(
      "ranking_mode: no valid ranking mode for service '%s' (per-integration='%s', global='%s'); using legacy mode 0",
      if (is.null(service)) "" else service, raw_svc, raw_glob)
    if (exists("logwarn")) logwarn(msg) else warning(msg)
  }
  "0"
}

# Ordered rank spec for a mode. Each entry is list(rank, sources, policy):
#   rank    : the rank number (1 = highest priority).
#   sources : names of the rank_sources token-sets that feed this rank (pooled).
#   policy  : "topup" (fill open label slots) or "exclusive" (only if still empty).
# Returns NULL for modes with no ranked selection (they fall back to legacy).
# The corpus is unchanged across modes; only this source->rank mapping differs.
rank_spec <- function(mode) {
  switch(as.character(mode),
    "1" = list(
      list(rank = 1L, sources = c("cleaned"),                          policy = "topup"),      # keywords + MeSH pooled
      list(rank = 2L, sources = c("heuristic"),                        policy = "exclusive")), # title n-grams
    "2" = list(
      list(rank = 1L, sources = c("cleaned_ex_mesh", "mesh_specific"), policy = "topup"),      # keywords + specific MeSH
      list(rank = 2L, sources = c("mesh_generic"),                     policy = "exclusive"),  # generic MeSH
      list(rank = 3L, sources = c("heuristic"),                        policy = "exclusive")),
    "3" = list(
      list(rank = 1L, sources = c("cleaned_ex_mesh"),                  policy = "topup"),                       # keywords
      list(rank = 2L, sources = c("mesh_specific"),                    policy = "topup", cross_denest = TRUE),  # specific MeSH tops up + cross-rank de-nest vs keywords (decisions #1/#6)
      list(rank = 3L, sources = c("mesh_generic"),                     policy = "exclusive"),                   # generic MeSH
      list(rank = 4L, sources = c("heuristic"),                        policy = "exclusive")),
    NULL)
}

# Assign a provenance rank to each candidate term (in "_"-joined, lowercased TDM
# form) from the per-cluster source token-sets. `sources` is a named list of token
# vectors (cleaned, cleaned_ex_mesh, mesh_specific, mesh_generic, heuristic); `spec`
# is the ordered rank_spec. A term takes the LOWEST rank among the sources that
# contain it (highest-rank-wins). Unknown terms (in no source — e.g. a
# normalization straggler) take the last rank and are counted for the drift alarm.
# Returns list(ranks = <int vector>, unknown = <int>).
rank_of_terms <- function(terms, sources, spec) {
  ranks <- rep(NA_integer_, length(terms))
  for (s in spec) {                       # spec is ordered by rank ascending
    pool <- unique(unlist(sources[s$sources], use.names = FALSE))
    hit <- is.na(ranks) & (terms %in% pool)
    ranks[hit] <- s$rank
  }
  max_rank <- max(vapply(spec, function(s) s$rank, integer(1)))
  unknown <- sum(is.na(ranks))
  ranks[is.na(ranks)] <- max_rank
  list(ranks = ranks, unknown = unknown)
}

# Waterfall selection over one cluster's ranked candidates. Walks the policy spec
# top->down: a "topup" rank fills open label slots; an "exclusive" rank contributes
# only if the label is still empty. De-nesting runs WITHIN each rank.
#   terms_us   : "_"-joined, weight-ordered survivors (post-prune).
#   term_ranks : aligned provenance-rank vector.
#   top_n      : max label terms.
#   denest_fn  : de-nester (filter_out_nested_ngrams); injectable for testing.
# Returns the label terms (space form), at most top_n.
select_by_rank <- function(terms_us, term_ranks, top_n, policy_spec,
                           denest_fn = filter_out_nested_ngrams) {
  label <- character(0)
  for (step in policy_spec) {
    if (identical(step$policy, "exclusive") && length(label) > 0) next
    # A cross-rank step (Mode 3 rank 2) may still REPLACE a nested term even when no
    # slots are open, so it must not be short-circuited by the open-slot guard.
    cross <- isTRUE(step$cross_denest) && length(label) > 0
    open <- top_n - length(label)
    if (open <= 0 && !cross) break
    sel <- terms_us[term_ranks == step$rank]          # weight-ordered
    if (length(sel) == 0) next
    sel <- trimws(gsub("_", " ", sel))
    sel <- unlist(denest_fn(sel, top_n))              # de-nest within rank
    if (length(sel) == 0) next
    if (cross) {
      # Cross-rank de-nesting (Mode 3, rank 1 <-> rank 2 only, decision #6): de-nest
      # this rank's candidates TOGETHER with the label built so far. String nesting
      # (filter_out_nested_ngrams): a specific-MeSH term that CONTAINS a selected
      # keyword replaces it in place (backfill, e.g. "cancer" -> "breast cancer"); a
      # specific-MeSH term nested INSIDE a keyword is dropped; keyword order is kept.
      label <- unlist(denest_fn(c(label, sel), top_n))
    } else {
      label <- c(label, head(sel, open))
    }
  }
  label
}

# Format label terms exactly as the legacy path: capitalise each term's first
# letter, join with ", ". Empty -> "".
format_label <- function(terms) {
  terms <- unlist(terms)
  if (length(terms) == 0) return("")
  terms <- trimws(terms)
  cap <- paste0(toupper(substr(terms, 1, 1)), substr(terms, 2, nchar(terms)))
  paste(cap, collapse = ", ")
}

# Area-label exclusion filter (post-tf-idf, PRE-ranking). Drops excluded terms from
# each cluster's tf-idf candidate list so they can never become a label AND never
# consume a top-n slot. Matching is WHOLE-TERM, case-insensitive, exact: a candidate
# term is normalised (underscores -> spaces, lowercased, trimmed) and dropped only if
# the ENTIRE term equals an excluded term — no substring / partial / nested-n-gram
# match, so multi-word terms ("Animal models", "Sports medicine") are untouched.
#   tfidf_top  : per-cluster named, descending tf-idf term lists.
#   exclusions : lowercase character vector (see get_label_exclusions). Empty = no-op.
drop_excluded_terms <- function(tfidf_top, exclusions) {
  if (!length(exclusions)) return(tfidf_top)
  ex <- tolower(trimws(exclusions))
  lapply(tfidf_top, function(w) {
    if (is.null(w) || length(w) == 0 || is.null(names(w))) return(w)
    norm <- trimws(tolower(gsub("_", " ", names(w))))
    w[!(norm %in% ex)]
  })
}

# Selection wedge: turn the per-cluster ranked tf-idf term lists into display
# labels according to `mode`.
#   - Mode 0 (or no rank_sources, or an unimplemented mode) -> the unchanged legacy
#     selection (`legacy_fn`, default get_top_names).
#   - Modes with a rank policy (Stage 1: Mode 1) -> shared prune + rank-aware
#     selection over the single global ranking, partitioned by `rank_sources`.
#   tfidf_top    : per-cluster named, descending tf-idf term lists.
#   top_n        : number of terms kept per label.
#   stops        : stopword vector.
#   mode         : ranking mode string (see RANKING_MODES).
#   rank_sources : named list of per-cluster token-sets (cleaned, cleaned_ex_mesh,
#                  mesh_specific, mesh_generic, heuristic), each a per-cluster list
#                  of lowercased "_"-joined tokens; NULL disables ranked selection.
#   legacy_fn    : the legacy selector; injectable for testing.
select_cluster_label_names <- function(tfidf_top, top_n, stops, mode = "0",
                                        rank_sources = NULL,
                                        legacy_fn = get_top_names) {
  spec <- rank_spec(mode)
  if (identical(mode, "0") || is.null(spec) || is.null(rank_sources)) {
    if (!identical(mode, "0") && (is.null(spec) || is.null(rank_sources))) {
      msg <- sprintf(
        "select_cluster_label_names: ranking mode '%s' not applied (no rank sources or mode unimplemented); using legacy selection",
        mode)
      if (exists("vslog")) vslog$warn(msg) else if (exists("logwarn")) logwarn(msg) else warning(msg)
    }
    return(legacy_fn(tfidf_top, top_n, stops))
  }

  n <- length(tfidf_top)
  out <- vector("list", n)
  dbg <- vector("list", n)
  unknown_total <- 0L
  for (k in seq_len(n)) {
    weights <- tfidf_top[[k]]
    nms <- names(weights)
    if (is.null(nms) || length(nms) == 0) { out[[k]] <- ""; next }
    # Shared prune head: same well-formedness filter as legacy, on the
    # global weight-ordered list. another_prune_ngrams preserves order.
    pruned <- unlist(another_prune_ngrams(nms, stops))
    if (length(pruned) == 0) { out[[k]] <- ""; next }
    sources_k <- lapply(rank_sources, function(src) src[[k]])   # this cluster's token-sets
    rr <- rank_of_terms(pruned, sources_k, spec)
    unknown_total <- unknown_total + rr$unknown
    out[[k]] <- format_label(select_by_rank(pruned, rr$ranks, top_n, spec))
    dbg[[k]] <- data.frame(cluster = k, term = gsub("_", " ", pruned),
                           rank = rr$ranks, weight = as.numeric(weights[pruned]),
                           stringsAsFactors = FALSE)
  }
  if (unknown_total > 0L) {
    msg <- sprintf("select_cluster_label_names: %d candidate term(s) had no rank source; assigned lowest rank", unknown_total)
    if (exists("vslog")) vslog$warn(msg) else if (exists("logwarn")) logwarn(msg)
  }
  if (exists("dump_data")) {
    dbg <- dbg[!vapply(dbg, is.null, logical(1))]
    if (length(dbg)) dump_data(do.call(rbind, dbg), "summarize_04c_rank_candidates")
  }
  out
}
