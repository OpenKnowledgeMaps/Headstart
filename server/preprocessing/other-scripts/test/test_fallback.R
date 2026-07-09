# Regression for the min1 fallback trigger (create_cluster_labels).
#
# With the map-wide DF filter (§6.1), a cluster can end up with a tiny min2 tf-idf
# that prunes to an empty label. The min1 fallback must catch this (trigger =
# "empty label", not "zero tf-idf sum"); otherwise the cluster drops straight to
# the abstract-frequency fallback and surfaces affiliation/email boilerplate.
#
# base_cancer_fallback is the captured real map that exhibited this (cluster 15:
# the reference label is "Breast cancer survivors, Cancer recurrence fear,
# Disease-free survival", but the bug produced "People Republic ChinaEmail, …").
#
# Runs inside the pipeline image (needs tm).

if (!exists("mode0_fallback_breakdown")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

FX <- file.path(REPLAY_DIR, "base_cancer_fallback.inputs.rds")

if (!file.exists(FX)) {
  cat("  (base_cancer_fallback fixture missing — skipping fallback regression)\n")
} else {
  bundle <- readRDS(FX)

  # Invariant: whenever the min2 label is empty but the min1 label is not, the
  # FINAL Mode-0 label must be the min1 label (the fallback fired before the
  # abstract-frequency last resort).
  test_that("min1 fallback fires on empty labels, not just zero tf-idf sum", {
    bd    <- mode0_fallback_breakdown(bundle)
    final <- replay_labels(FX, mode = "0")
    n <- bundle$clusters$num_clusters
    checked <- 0
    for (k in seq_len(n)) {
      if (!nzchar(bd$min2[k]) && nzchar(bd$min1[k])) {
        checked <- checked + 1
        expect_equal(unname(final[[as.character(k)]]), unname(bd$min1[k]))
      }
    }
    expect_true(checked > 0)   # the fixture must actually exercise the fallback
  })

  # Concrete anchor: the cluster that motivated the fix reproduces its reference
  # label rather than the abstract-fallback boilerplate.
  test_that("base_cancer_fallback cluster 15 gets its reference (min1) label", {
    final <- replay_labels(FX, mode = "0")
    expect_equal(final[["15"]],
                 "Breast cancer survivors, Cancer recurrence fear, Disease-free survival")
    expect_false(grepl("Email", final[["15"]]))
  })
}
