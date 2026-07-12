# Replay regression over real fixtures (replay_harness.R).
#
# For every fixture bundle in test/replay/*.inputs.rds, and every mode in
# REPLAY_MODES:
#   - replay under that mode and assert the labels match the stored expected output;
#   - if no expected output exists yet, record it (bootstrap) and pass.
# Mode 0 baselines are <name>.expected.rds; Mode N are <name>.expected.modeN.rds.
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

# Modes with committed baselines. Mode 0 is the byte-identical legacy baseline;
# Mode 1 pins the first ranked mode. Add "2"/"3" here as those modes land.
REPLAY_MODES <- c("0", "1")

fixtures <- fixture_files()

if (length(fixtures) == 0) {
  cat("  (no fixtures in ", REPLAY_DIR, " yet — see README.md to capture some)\n", sep = "")
} else {
  for (fx in fixtures) {
    name <- fixture_name(fx)
    for (m in REPLAY_MODES) {
      test_that(sprintf("Mode-%s labels are stable for fixture '%s'", m, name), {
        labels <- replay_labels(fx, mode = m)
        if (!file.exists(expected_file(name, m))) {
          write_expected(name, labels, m)
          cat("  (recorded Mode-", m, " expected output for '", name, "')\n", sep = "")
          expect_true(TRUE)
        } else {
          expect_equal(labels, read_expected(name, m))
        }
      })
      gc(verbose = FALSE)   # keep peak memory bounded across 39 fixtures x N modes
    }
  }
}
