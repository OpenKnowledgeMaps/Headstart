# Replay regression over real fixtures (replay_harness.R).
#
# For every fixture bundle in test/replay/*.inputs.rds:
#   - replay under Mode 0 and assert the labels match the stored expected output;
#   - if no expected output exists yet, record it (bootstrap) and pass.
# Fixtures are created from real maps — see test/replay/README.md.
#
# Runs inside the pipeline image (needs tm). Skips cleanly when no fixtures exist,
# so it is safe to keep in the default suite before any datasets are captured.

if (!exists("replay_labels")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

fixtures <- fixture_files()

if (length(fixtures) == 0) {
  cat("  (no fixtures in ", REPLAY_DIR, " yet — see README.md to capture some)\n", sep = "")
} else {
  for (fx in fixtures) {
    name <- fixture_name(fx)
    test_that(paste0("Mode-0 labels are stable for fixture '", name, "'"), {
      labels <- replay_labels(fx, mode = "0")
      if (!file.exists(expected_file(name))) {
        write_expected(name, labels)
        cat("  (recorded expected output for '", name, "')\n", sep = "")
        expect_true(TRUE)
      } else {
        expect_equal(labels, read_expected(name))
      }
    })
  }
}
