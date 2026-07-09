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

# is_nested() and mode1_cluster_breakdown() are provided by replay_harness.R.

fmt <- function(x, n = 8) if (length(x)) paste(head(x, n), collapse = " | ") else "(none)"

mine <- function(path) {
  name <- fixture_name(path)
  cand <- mode1_cluster_breakdown(readRDS(path))$clusters
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

args <- commandArgs(trailingOnly = TRUE)
files <- if (length(args)) args else fixture_files()
for (f in files) mine(f)
