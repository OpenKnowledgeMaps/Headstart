# Mode-2 robustness + differential regression.
#
# Mode 2 needs the MeSH rank columns (keywords_rank_mesh_specific/generic). The
# replay harness now derives them from subject_orig (exactly as base.R does), so a
# MeSH-bearing fixture exercises the real specific/generic split, while a MeSH-free
# input must degrade cleanly to Mode-1 output (rank 1 = keywords == cleaned_ex_mesh,
# the empty MeSH ranks skipped, heuristic last).
#
# Runs inside the pipeline image (needs tm).

if (!exists("replay_labels")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

# Degradation: the synthetic bundle has no subject_orig / no [MeSH] markers, so the
# MeSH columns come out empty and Mode 2 must equal Mode 1.
test_that("Mode 2 degrades to Mode 1 when no MeSH is present", {
  b <- build_synthetic_bundle()
  expect_equal(unname(unlist(replay_labels(b, mode = "2"))),
               unname(unlist(replay_labels(b, mode = "1"))))
})

# Differential: on a MeSH-bearing fixture the split is active — generic MeSH
# (e.g. "Neoplasms", "Europe") is demoted to the exclusive generic rank, so Mode 2
# diverges from Mode 1.
FX <- file.path(REPLAY_DIR, "base_cancer_research.inputs.rds")
if (!file.exists(FX)) {
  cat("  (base_cancer_research fixture missing — skipping Mode-2 differential test)\n")
} else {
  test_that("Mode 2 activates the MeSH split on a MeSH-bearing map (differs from Mode 1)", {
    m1 <- replay_labels(FX, mode = "1")
    m2 <- replay_labels(FX, mode = "2")
    expect_false(identical(unname(unlist(m2)), unname(unlist(m1))))  # split is active
    # the cluster whose Mode-1 label led with generic MeSH no longer does under Mode 2.
    expect_false(grepl("Neoplasms|Europe", m2[["3"]]))
  })
}
