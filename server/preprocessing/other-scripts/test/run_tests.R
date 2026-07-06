#!/usr/bin/env Rscript
# Test runner for the other-scripts R unit tests.
#
# Uses `testthat` if installed; otherwise falls back to test/testthat_shim.R so
# the suite runs inside the pipeline image (which has no testthat). Exits with a
# non-zero status if any test fails, so it is CI-friendly.
#
# Usage (from the other-scripts/ directory):
#   Rscript test/run_tests.R                 # run the default suite
#   Rscript test/run_tests.R test/test_ranking_config.R   # run specific file(s)

args <- commandArgs(trailingOnly = TRUE)

use_testthat <- requireNamespace("testthat", quietly = TRUE)
if (use_testthat) {
  library(testthat)
  cat("Using installed testthat.\n")
} else {
  source("test/testthat_shim.R")
  cat("testthat not installed — using dependency-free shim.\n")
}

# Default suite: the pure-base-R test files (run anywhere, no tm/logging needed).
default_files <- c(
  "test/test_subject_cleaning.R",
  "test/test_ranking_config.R",
  "test/test_ranking_wedge.R"
)
test_files <- if (length(args) > 0) args else default_files

for (f in test_files) {
  cat("\n== ", f, " ==\n", sep = "")
  if (use_testthat) testthat::test_file(f) else source(f)
}

if (!use_testthat) {
  cat(sprintf("\n---\n%d passed, %d failed\n",
              .shim_results$pass, .shim_results$fail))
  if (.shim_results$fail > 0) {
    cat("Failures:\n")
    cat(paste0("  - ", .shim_results$failures, collapse = "\n"), "\n", sep = "")
    quit(status = 1, save = "no")
  }
}
