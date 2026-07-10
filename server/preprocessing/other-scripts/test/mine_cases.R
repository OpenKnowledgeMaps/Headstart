#!/usr/bin/env Rscript
# Mine Mode-1 replay fixtures for cluster-level test cases (Stage 1 selection).
#
# For every fixture bundle in test/replay/*.inputs.rds, replay the labelling under
# Mode 1 and classify each cluster into the situations we want to pin as tests:
#   [RANK1-ONLY] label is all rank 1 AND rank-2 candidates existed but were
#                excluded  -> proves exclusivity / no backfill.
#   [RANK2-FALL] no rank-1 candidates survived; label came from the heuristic rank.
#   [DE-NEST]    a nested term pair within one rank; de-nesting kept the specific one.
# Each hit is printed in the format a test case needs: the tf-idf-sorted terms per
# rank + the expected area label.
#
# Run inside the pipeline image, renv bypassed:
#   sh test/run_tests.sh   # (no — that runs the suite)
#   R_PROFILE_USER=/dev/null Rscript test/mine_cases.R [fixture.inputs.rds ...]

suppressWarnings(suppressMessages(source("test/replay_harness.R")))

TOP_N <- 3
SPEC  <- rank_policies("1")

# word-sequence containment: is `a` a contiguous run of words inside `b`?
is_nested <- function(a, b) {
  a != b && grepl(paste0(" ", a, " "), paste0(" ", b, " "), fixed = TRUE)
}

# Recompute the Mode-1 per-cluster candidates exactly as create_cluster_labels does.
cluster_candidates <- function(bundle) {
  md <- add_heuristic_keyword_fields(backfill_subject_is_heuristic(bundle$metadata), bundle$stops)
  md$keywords_rank_cleaned <- md$subject
  co <- get_cluster_corpus(bundle$clusters, md, bundle$stops, bundle$taxonomy_separator, heuristic_col = HEUR_MIN2)
  tdm <- TermDocumentMatrix(co$corpus, control = list(
    tokenize = SplitTokenizer, weighting = function(x) weightSMART(x, spec = "ntn"),
    bounds = list(local = c(1, Inf)), tolower = TRUE))
  tt <- apply(tdm, 2, function(x) { x2 <- sort(x, TRUE); x2[x2 > 0] })
  empty <- which(apply(tdm, 2, sum) == 0)
  if (length(empty)) {
    fb <- get_cluster_corpus(bundle$clusters, md, bundle$stops, bundle$taxonomy_separator, heuristic_col = HEUR_MIN1)$corpus
    tt[empty] <- fill_empty_clusters(fb)[empty]
  }

  out <- vector("list", length(tt))
  for (k in seq_along(tt)) {
    nms <- names(tt[[k]]); if (is.null(nms) || !length(nms)) next
    pruned <- unlist(another_prune_ngrams(nms, bundle$stops)); if (!length(pruned)) next
    rr <- rank_of_terms(pruned, co$rank_sources$cleaned[[k]], co$rank_sources$heuristic[[k]], SPEC)
    sp <- trimws(gsub("_", " ", pruned))
    out[[k]] <- list(
      r1    = sp[rr$ranks == 1],                       # rank-1 terms, weight-ordered
      r2    = sp[rr$ranks == 2],                       # rank-2 terms, weight-ordered
      label = format_label(select_by_rank(pruned, rr$ranks, TOP_N, SPEC)))
  }
  out
}

fmt <- function(x, n = 8) if (length(x)) paste(head(x, n), collapse = " | ") else "(none)"

mine <- function(path) {
  name <- fixture_name(path)
  cand <- cluster_candidates(readRDS(path))
  for (k in seq_along(cand)) {
    c <- cand[[k]]; if (is.null(c) || !nzchar(c$label)) next
    hits <- character(0)
    if (length(c$r1) > 0 && length(c$r2) > 0) hits <- c(hits, "RANK1-ONLY")
    if (length(c$r1) == 0 && length(c$r2) > 0) hits <- c(hits, "RANK2-FALL")
    # de-nesting: a nested pair within the selected rank's top candidates
    sel_rank <- if (length(c$r1) > 0) c$r1 else c$r2
    top <- head(sel_rank, 6)
    nested <- FALSE
    for (i in seq_along(top)) for (j in seq_along(top))
      if (i != j && is_nested(top[i], top[j])) nested <- TRUE
    if (nested) hits <- c(hits, "DE-NEST")
    if (!length(hits)) next
    cat(sprintf("\n[%s]  %s  cluster %d\n", paste(hits, collapse = ","), name, k))
    cat("   rank1:", fmt(c$r1), "\n")
    cat("   rank2:", fmt(c$r2), "\n")
    cat("   label:", c$label, "\n")
  }
}

# Only mine when run as a script (Rscript test/mine_cases.R ...), not when another
# script sources this file for its helpers (e.g. test/orcid_review_list.R).
if (sys.nframe() == 0) {
  args <- commandArgs(trailingOnly = TRUE)
  files <- if (length(args)) args else fixture_files()
  for (f in files) mine(f)
}
