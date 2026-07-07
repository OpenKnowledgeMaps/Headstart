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

# Ordered rank/fill-policy spec for a mode. Each entry is list(rank, policy) where
# policy is "topup" (fill open label slots) or "exclusive" (contribute only if the
# label is still empty). Returns NULL for modes with no ranked selection yet, which
# fall back to the legacy selection.
rank_policies <- function(mode) {
  switch(as.character(mode),
    "1" = list(list(rank = 1L, policy = "topup"),      # keywords + MeSH (pooled)
               list(rank = 2L, policy = "exclusive")), # heuristic title n-grams
    NULL)
}

# Assign a provenance rank to each candidate term (in "_"-joined, lowercased TDM
# form) from the separated rank sources: rank 1 if it is a cleaned keyword, rank 2
# if it is only a heuristic title n-gram. As a fallback, unknown terms (in neither — e.g. a
# normalization straggler) take the lowest rank and are
# counted for debug purposes. Returns list(ranks = <int vector>, unknown = <int>).
rank_of_terms <- function(terms, cleaned, heuristic, policy_spec) {
  max_rank <- max(vapply(policy_spec, function(s) s$rank, integer(1)))
  r <- ifelse(terms %in% cleaned, 1L,
       ifelse(terms %in% heuristic, 2L, NA_integer_))
  unknown <- sum(is.na(r))
  r[is.na(r)] <- max_rank
  list(ranks = r, unknown = unknown)
}

# Waterfall selection over one cluster's ranked candidates. Walks the policy spec
# top->down: a "topup" rank fills open label slots; an "exclusive" rank contributes
# only if the label is still empty. De-nesting runs WITHIN each rank (decision #6).
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
    open <- top_n - length(label)
    if (open <= 0) break
    sel <- terms_us[term_ranks == step$rank]          # weight-ordered
    if (length(sel) == 0) next
    sel <- trimws(gsub("_", " ", sel))
    sel <- unlist(denest_fn(sel, top_n))              # de-nest within rank
    if (length(sel) == 0) next
    label <- c(label, head(sel, open))
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
#   rank_sources : list(cleaned, heuristic), each a per-cluster list of lowercased
#                  "_"-joined tokens; NULL disables ranked selection.
#   legacy_fn    : the legacy selector; injectable for testing.
select_cluster_label_names <- function(tfidf_top, top_n, stops, mode = "0",
                                        rank_sources = NULL,
                                        legacy_fn = get_top_names) {
  policy_spec <- rank_policies(mode)
  if (identical(mode, "0") || is.null(policy_spec) || is.null(rank_sources)) {
    if (!identical(mode, "0") && (is.null(policy_spec) || is.null(rank_sources))) {
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
    # Shared prune head (§3 step 1): same well-formedness filter as legacy, on the
    # global weight-ordered list. another_prune_ngrams preserves order.
    pruned <- unlist(another_prune_ngrams(nms, stops))
    if (length(pruned) == 0) { out[[k]] <- ""; next }
    rr <- rank_of_terms(pruned, rank_sources$cleaned[[k]], rank_sources$heuristic[[k]], policy_spec)
    unknown_total <- unknown_total + rr$unknown
    out[[k]] <- format_label(select_by_rank(pruned, rr$ranks, top_n, policy_spec))
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
