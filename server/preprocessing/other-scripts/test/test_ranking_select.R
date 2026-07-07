# Unit tests for the rank-aware selection helpers (ranking.R): rank_policies,
# rank_of_terms, select_by_rank, format_label.
#
# Pure base R — the only summarize.R dependency (filter_out_nested_ngrams) is
# injected as a stub, so these run anywhere. The full path with the real prune /
# de-nest is exercised by the replay tests.

if (!exists("select_by_rank")) source("ranking.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

spec1 <- rank_policies("1")
id_denest <- function(x, n) head(x, n)   # identity-ish de-nester for isolation

# --- rank_policies -----------------------------------------------------------
test_that("rank_policies: mode 1 is topup rank1 then exclusive rank2", {
  expect_equal(length(spec1), 2)
  expect_equal(spec1[[1]]$rank, 1L); expect_equal(spec1[[1]]$policy, "topup")
  expect_equal(spec1[[2]]$rank, 2L); expect_equal(spec1[[2]]$policy, "exclusive")
})

test_that("rank_policies: unimplemented modes return NULL", {
  expect_null(rank_policies("2"))
  expect_null(rank_policies("3"))
  expect_null(rank_policies("9"))
})

# --- rank_of_terms -----------------------------------------------------------
test_that("rank_of_terms: cleaned->1, heuristic-only->2, unknown->lowest rank", {
  r <- rank_of_terms(c("a", "b", "c"), cleaned = c("a"), heuristic = c("b"), spec1)
  expect_equal(r$ranks, c(1L, 2L, 2L))   # c is unknown -> lowest rank (2)
  expect_equal(r$unknown, 1L)
})

test_that("rank_of_terms: highest-rank-wins when a term is in both sources", {
  r <- rank_of_terms("x", cleaned = "x", heuristic = "x", spec1)
  expect_equal(unname(r$ranks), 1L)
  expect_equal(r$unknown, 0L)
})

# --- select_by_rank ----------------------------------------------------------
test_that("select_by_rank: rank 1 fills up to top_n", {
  lab <- select_by_rank(c("k1", "k2", "k3", "k4"), c(1L, 1L, 1L, 1L), 3, spec1, id_denest)
  expect_equal(lab, c("k1", "k2", "k3"))
})

test_that("select_by_rank: exclusive rank 2 is skipped while rank 1 is non-empty", {
  lab <- select_by_rank(c("k1", "h1", "h2"), c(1L, 2L, 2L), 3, spec1, id_denest)
  expect_equal(lab, "k1")                 # < top_n is acceptable; no backfill (§15-0)
})

test_that("select_by_rank: falls to rank 2 only when rank 1 is empty", {
  lab <- select_by_rank(c("h1", "h2"), c(2L, 2L), 3, spec1, id_denest)
  expect_equal(lab, c("h1", "h2"))
})

test_that("select_by_rank: underscores become spaces", {
  expect_equal(select_by_rank("sea_level_rise", 1L, 3, spec1, id_denest), "sea level rise")
})

test_that("select_by_rank: empty input yields an empty label", {
  expect_equal(length(select_by_rank(character(0), integer(0), 3, spec1, id_denest)), 0)
})

# --- format_label ------------------------------------------------------------
test_that("format_label capitalises each term and joins with ', '", {
  expect_equal(format_label(c("climate change", "sea level")), "Climate change, Sea level")
})

test_that("format_label of nothing is the empty string", {
  expect_equal(format_label(character(0)), "")
})
