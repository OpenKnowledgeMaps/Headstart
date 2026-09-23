# Plumbing tests for the replay harness (replay_harness.R).
#
# Validates the harness machinery on a synthetic input bundle — no external data,
# no docker fixture needed — so it runs as soon as tm is available. The
# data-driven regression over real fixtures lives in test_replay_modes.R.

if (!exists("replay_labels")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

bundle <- build_synthetic_bundle()

test_that("replay produces one label per cluster", {
  labels <- replay_labels(bundle, mode = "0")
  expect_equal(length(labels), bundle$clusters$num_clusters)
  expect_equal(names(labels), c("1", "2"))
})

test_that("labels reflect the two distinct clusters (non-empty, different)", {
  labels <- replay_labels(bundle, mode = "0")
  expect_true(all(nzchar(labels)))
  expect_false(labels[["1"]] == labels[["2"]])
  # cluster 1 is the climate cluster, cluster 2 the ML cluster
  expect_match(tolower(labels[["1"]]), "climate|sea level")
  expect_match(tolower(labels[["2"]]), "machine|neural|learning")
})

test_that("replay is deterministic across repeated runs", {
  expect_equal(replay_labels(bundle, mode = "0"),
               replay_labels(bundle, mode = "0"))
})

test_that("mode 1 runs and yields sensible rank-1 labels", {
  labels <- replay_labels(bundle, mode = "1")
  expect_equal(length(labels), bundle$clusters$num_clusters)
  expect_true(all(nzchar(labels)))
  expect_false(labels[["1"]] == labels[["2"]])
  # rank 1 = the subject keywords; labels stay on-theme
  expect_match(tolower(labels[["1"]]), "climate|sea level")
  expect_match(tolower(labels[["2"]]), "machine|neural|learning")
  # title-only heuristics (rank 2) are excluded while rank 1 is non-empty
  expect_false(grepl("recognition|image", tolower(labels[["2"]])))
})

test_that("replay restores the environment it changed", {
  before_rank <- Sys.getenv("RANKING_MODE")
  before_log  <- Sys.getenv("LOGLEVEL")
  invisible(replay_labels(bundle, mode = "1"))
  expect_equal(Sys.getenv("RANKING_MODE"), before_rank)
  expect_equal(Sys.getenv("LOGLEVEL"), before_log)
})
