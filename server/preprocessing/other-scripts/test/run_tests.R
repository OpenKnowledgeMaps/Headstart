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

# Pure-base-R test files (run anywhere, no tm/logging needed).
base_files <- c(
  "test/test_subject_cleaning.R",
  "test/test_ranking_config.R",
  "test/test_ranking_wedge.R",
  "test/test_ranking_select.R",
  "test/test_mesh_classification.R",
  "test/test_mesh_fields.R"
)
# Replay tests need the tm stack — included only when tm is available (i.e. inside
# the pipeline image, run via test/run_tests.sh), skipped on a bare host.
replay_files <- c(
  "test/test_replay_harness.R",
  "test/test_replay_modes.R",
  "test/test_replace_keywords_routing.R",
  "test/test_mode1_selection.R",
  "test/test_fallback.R",
  "test/test_mode2.R"
)
default_files <- base_files
if (requireNamespace("tm", quietly = TRUE)) {
  default_files <- c(default_files, replay_files)
} else {
  cat("tm not available — skipping replay tests (run inside the container via test/run_tests.sh).\n")
}
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
