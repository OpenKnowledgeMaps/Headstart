# label_debug.R
# DEBUG-gated dump helpers tracing how each area label is built (no-ops
# unless LOGLEVEL=DEBUG; see utils.R dump_data). Sourced by summarize.R.


# --- Label-generation debug dumps ------------------------------------------------
# Fine-grained, DEBUG-gated traces of how each cluster's area label is built, for
# backtracking a label to its inputs: the corpus text that feeds tf-idf, the tf-idf
# candidate terms with their weights, the rank-source provenance (Modes 1-3), the
# terms removed by the exclusion list, and the per-cluster label provenance (which
# path produced it, plus the label before/after casing). Each keyed on VIS_ID via
# dump_data; all no-ops unless LOGLEVEL=DEBUG, and never fatal.

# Per-cluster corpus document text (what tf-idf actually tokenizes). One row/cluster.
dump_corpus_text <- function(corpus, stage) {
  if (!debug_enabled()) return(invisible(NULL))
  tryCatch({
    txt <- vapply(seq_along(corpus),
                  function(k) paste(as.character(content(corpus[[k]])), collapse = " "),
                  character(1))
    dump_data(data.frame(cluster = seq_along(txt), text = txt, stringsAsFactors = FALSE), stage)
  }, error = function(e) vslog$warn(paste("dump_corpus_text failed:", conditionMessage(e))))
}


# Per-cluster tf-idf candidate terms, weight-ordered, with their scores. One row per
# (cluster, term): the candidate pool that selection/ranking draws from.
dump_tfidf_candidates <- function(tfidf_top, stage) {
  if (!debug_enabled()) return(invisible(NULL))
  tryCatch({
    rows <- lapply(seq_along(tfidf_top), function(k) {
      w <- tfidf_top[[k]]
      if (is.null(w) || !length(w) || is.null(names(w))) return(NULL)
      data.frame(cluster = k, weight_rank = seq_along(w),
                 term = gsub("_", " ", names(w)), tfidf = as.numeric(w),
                 stringsAsFactors = FALSE)
    })
    rows <- do.call(rbind, rows[!vapply(rows, is.null, logical(1))])
    if (!is.null(rows) && nrow(rows)) dump_data(rows, stage)
  }, error = function(e) vslog$warn(paste("dump_tfidf_candidates failed:", conditionMessage(e))))
}


# Per-cluster rank-source token-sets (Modes 1-3): which provenance set (cleaned,
# mesh_specific, ...) each candidate token belongs to — i.e. what fixes its rank.
dump_rank_sources <- function(rank_sources, stage) {
  if (!debug_enabled() || is.null(rank_sources)) return(invisible(NULL))
  tryCatch({
    rows <- list()
    for (src in names(rank_sources)) {
      per_cluster <- rank_sources[[src]]
      for (k in seq_along(per_cluster)) {
        toks <- per_cluster[[k]]
        if (length(toks)) rows[[length(rows) + 1L]] <-
          data.frame(cluster = k, source = src, term = gsub("_", " ", toks),
                     stringsAsFactors = FALSE)
      }
    }
    if (length(rows)) dump_data(do.call(rbind, rows), stage)
  }, error = function(e) vslog$warn(paste("dump_rank_sources failed:", conditionMessage(e))))
}


# Per-cluster terms removed by the exclusion list (tf-idf candidates before vs after
# drop_excluded_terms). Makes each exclusion drop explicit.
dump_excluded_terms <- function(before, after, stage) {
  if (!debug_enabled()) return(invisible(NULL))
  tryCatch({
    rows <- lapply(seq_along(before), function(k) {
      b <- before[[k]]; a <- after[[k]]
      if (is.null(b) || !length(b) || is.null(names(b))) return(NULL)
      dropped <- setdiff(names(b), names(a))
      if (!length(dropped)) return(NULL)
      data.frame(cluster = k, term = gsub("_", " ", dropped),
                 tfidf = as.numeric(b[dropped]), stringsAsFactors = FALSE)
    })
    rows <- do.call(rbind, rows[!vapply(rows, is.null, logical(1))])
    if (!is.null(rows) && nrow(rows)) dump_data(rows, stage)
  }, error = function(e) vslog$warn(paste("dump_excluded_terms failed:", conditionMessage(e))))
}
