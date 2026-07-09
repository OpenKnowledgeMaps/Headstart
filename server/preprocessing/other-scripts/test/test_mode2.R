# Mode-2 robustness regression.
#
# Mode 2 needs the MeSH rank columns (keywords_rank_mesh_specific/generic) which
# are produced upstream by the BASE client. When they are absent (any current
# fixture, and any integration without MeSH), Mode 2 must **degrade to Mode-1
# behaviour**: rank 1 = keywords (cleaned_ex_mesh == cleaned), the empty MeSH ranks
# are skipped, heuristic is the last rank. This test pins that on a real fixture.
#
# Once a MeSH-bearing fixture exists (BASE client re-run), a differential Mode-2
# case (generic MeSH demoted) will be added here.
#
# Runs inside the pipeline image (needs tm).

if (!exists("replay_labels")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

FX <- file.path(REPLAY_DIR, "base_cancer_research.inputs.rds")

if (!file.exists(FX)) {
  cat("  (base_cancer_research fixture missing — skipping Mode-2 robustness test)\n")
} else {
  test_that("Mode 2 degrades to Mode 1 when no MeSH columns are present", {
    m1 <- replay_labels(FX, mode = "1")
    m2 <- replay_labels(FX, mode = "2")
    expect_equal(unname(unlist(m2)), unname(unlist(m1)))
  })
}
