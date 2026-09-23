# Mode-1 selection regression tests, replayed over the real fixtures.
#
# These pin the Stage-1 ranking behaviour end-to-end (corpus + rank map + waterfall)
# on frozen real data, complementing the pure-unit tests in test_ranking_select.R:
#   G1  guard:   no candidate term drifts out of the rank map (unknown == 0).
#   G2  de-nesting:    no area label contains a term nested inside another.
#   C1  exclusivity:   with rank 1 present, the label is drawn ONLY from rank 1.
#   C2  fallback:      with rank 1 empty, the label falls back to rank 2 (non-empty).
# Runs inside the pipeline image (needs tm).

if (!exists("mode1_cluster_breakdown")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

fixtures <- fixture_files()

# Cache the (relatively expensive) per-fixture breakdown across tests.
.bd_cache <- new.env(parent = emptyenv())
breakdown <- function(fx) {
  if (is.null(.bd_cache[[fx]])) .bd_cache[[fx]] <- mode1_cluster_breakdown(readRDS(fx))
  .bd_cache[[fx]]
}
each_cluster <- function(f) {
  for (fx in fixtures) for (c in breakdown(fx)$clusters) if (!is.null(c) && nzchar(c$label)) f(c, fx)
}
# First cluster across all fixtures whose breakdown satisfies `pred`.
first_match <- function(pred) {
  for (fx in fixtures) {
    cl <- breakdown(fx)$clusters
    for (k in seq_along(cl)) if (!is.null(cl[[k]]) && nzchar(cl[[k]]$label) && pred(cl[[k]]))
      return(list(fx = fixture_name(fx), k = k, c = cl[[k]]))
  }
  NULL
}

if (length(fixtures) == 0) {
  cat("  (no fixtures in test/replay — skipping Mode-1 selection tests)\n")
} else {

  # G1: every pruned tf-idf term resolves to a rank (no drift).
  test_that("Mode 1: zero unknown-rank terms across all fixtures", {
    total <- 0
    for (fx in fixtures) total <- total + breakdown(fx)$unknown_total
    expect_equal(total, 0)
  })

  # G2 — within-rank de-nesting: no label carries a nested term pair.
  test_that("Mode 1: no area label contains a term nested in another", {
    bad <- character(0)
    each_cluster(function(c, fx) {
      t <- c$label_terms
      for (i in seq_along(t)) for (j in seq_along(t))
        if (i != j && is_nested(t[i], t[j]))
          bad <<- c(bad, paste0(fixture_name(fx), ": ", c$label))
    })
    expect_equal(unique(bad), character(0))
  })

  # C1 — exclusivity: rank 1 and rank 2 both present -> label is all rank 1.
  test_that("Mode 1: with rank 1 present, the label is drawn only from rank 1", {
    m <- first_match(function(c) length(c$r1) > 0 && length(c$r2) > 0)
    expect_true(!is.null(m))
    expect_true(all(m$c$label_terms %in% m$c$r1))   # no rank-2 heuristic leaked in
    expect_true(length(m$c$label_terms) > 0)
  })

  # C2 — fallback: rank 1 empty -> label comes from rank 2, non-empty.
  test_that("Mode 1: with rank 1 empty, the label falls back to rank 2 (non-empty)", {
    m <- first_match(function(c) length(c$r1) == 0 && length(c$r2) > 0)
    expect_true(!is.null(m))
    expect_true(all(m$c$label_terms %in% m$c$r2))   # label is heuristic, as expected
    expect_true(nzchar(m$c$label))
  })
}
