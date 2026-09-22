# Regression anchor for the fallback path (create_cluster_labels).
#
# base_cancer_fallback is a captured real map where cluster 15 once regressed to
# affiliation/email boilerplate ("People Republic ChinaEmail, …") instead of its
# reference label. This pins that one cluster so the boilerplate regression can't
# recur.
#
# NB: the broader min2 -> min1 "empty-label" fallback invariant that used to live
# here was Modes-1-3-specific (that trigger is the DF-filter's; Mode 0 uses the
# legacy zero-sum fallback) and no longer mapped to Mode 0's path, so it was reduced
# to this concrete guard.
#
# Runs inside the pipeline image (needs tm).

if (!exists("replay_labels")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

FX <- file.path(REPLAY_DIR, "base_cancer_fallback.inputs.rds")

if (!file.exists(FX)) {
  cat("  (base_cancer_fallback fixture missing — skipping fallback regression)\n")
} else {
  # The cluster that motivated the fix reproduces its reference label rather than
  # the abstract-fallback boilerplate.
  test_that("base_cancer_fallback cluster 15 gets its reference label, not boilerplate", {
    final <- replay_labels(FX, mode = "0")
    expect_equal(final[["15"]],
                 "Breast cancer survivors, Cancer recurrence fear, Disease-free survival")
    expect_false(grepl("Email", final[["15"]]))
  })
}
