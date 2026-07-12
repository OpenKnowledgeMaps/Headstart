# Unit tests for the rank-aware selection helpers (ranking.R): rank_spec,
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

spec1 <- rank_spec("1")
id_denest <- function(x, n) head(x, n)   # identity-ish de-nester for isolation

# --- rank_spec ---------------------------------------------------------------
test_that("rank_spec: mode 1 is topup rank1 (cleaned) then exclusive rank2 (heuristic)", {
  expect_equal(length(spec1), 2)
  expect_equal(spec1[[1]]$rank, 1L); expect_equal(spec1[[1]]$sources, "cleaned");   expect_equal(spec1[[1]]$policy, "topup")
  expect_equal(spec1[[2]]$rank, 2L); expect_equal(spec1[[2]]$sources, "heuristic"); expect_equal(spec1[[2]]$policy, "exclusive")
})

test_that("rank_spec: mode 2 pools cleaned_ex_mesh + specific in rank 1, generic exclusive", {
  s <- rank_spec("2")
  expect_equal(length(s), 3)
  expect_equal(s[[1]]$sources, c("cleaned_ex_mesh", "mesh_specific")); expect_equal(s[[1]]$policy, "topup")
  expect_equal(s[[2]]$sources, "mesh_generic"); expect_equal(s[[2]]$policy, "exclusive")
  expect_equal(s[[3]]$sources, "heuristic");    expect_equal(s[[3]]$policy, "exclusive")
})

test_that("rank_spec: mode 3 tops up specific MeSH, generic + heuristic exclusive", {
  s <- rank_spec("3")
  expect_equal(length(s), 4)
  expect_equal(s[[1]]$sources, "cleaned_ex_mesh"); expect_equal(s[[1]]$policy, "topup")
  expect_equal(s[[2]]$sources, "mesh_specific");   expect_equal(s[[2]]$policy, "topup")   # top-up (decision #1)
  expect_equal(s[[3]]$sources, "mesh_generic");    expect_equal(s[[3]]$policy, "exclusive")
  expect_equal(s[[4]]$sources, "heuristic");       expect_equal(s[[4]]$policy, "exclusive")
})

test_that("rank_spec: unimplemented modes return NULL", {
  expect_null(rank_spec("9"))
})

# --- rank_of_terms (named source-sets) ---------------------------------------
test_that("rank_of_terms: mode 1 — cleaned->1, heuristic-only->2, unknown->lowest", {
  r <- rank_of_terms(c("a", "b", "c"), list(cleaned = "a", heuristic = "b"), spec1)
  expect_equal(r$ranks, c(1L, 2L, 2L))   # c is unknown -> lowest rank (2)
  expect_equal(r$unknown, 1L)
})

test_that("rank_of_terms: highest-rank-wins when a term is in two sources", {
  r <- rank_of_terms("x", list(cleaned = "x", heuristic = "x"), spec1)
  expect_equal(r$ranks, 1L)
  expect_equal(r$unknown, 0L)
})

test_that("rank_of_terms: mode 2 — specific pools into rank 1, generic is rank 2", {
  s <- rank_spec("2")
  srcs <- list(cleaned_ex_mesh = "kw", mesh_specific = "sp", mesh_generic = "gen", heuristic = "ng")
  r <- rank_of_terms(c("kw", "sp", "gen", "ng"), srcs, s)
  expect_equal(r$ranks, c(1L, 1L, 2L, 3L))   # kw & sp -> rank 1; gen -> 2; ng -> 3
})

test_that("rank_of_terms: mode 2 degrades when mesh sources are empty", {
  s <- rank_spec("2")
  # no mesh: cleaned_ex_mesh carries the keywords, mesh sources empty
  srcs <- list(cleaned_ex_mesh = c("kw1", "kw2"), mesh_specific = character(0),
               mesh_generic = character(0), heuristic = "ng")
  r <- rank_of_terms(c("kw1", "kw2", "ng"), srcs, s)
  expect_equal(r$ranks, c(1L, 1L, 3L))       # behaves like Mode 1 (keywords rank 1, heuristic last)
})

# --- select_by_rank ----------------------------------------------------------
test_that("select_by_rank: rank 1 fills up to top_n", {
  lab <- select_by_rank(c("k1", "k2", "k3", "k4"), c(1L, 1L, 1L, 1L), 3, spec1, id_denest)
  expect_equal(lab, c("k1", "k2", "k3"))
})

test_that("select_by_rank: exclusive rank 2 is skipped while rank 1 is non-empty", {
  lab <- select_by_rank(c("k1", "h1", "h2"), c(1L, 2L, 2L), 3, spec1, id_denest)
  expect_equal(lab, "k1")                 # < top_n is acceptable; no backfill
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

# --- drop_excluded_terms -----------------------------------------------------
# tfidf_top entries are per-cluster named numeric weight vectors.
nw <- function(...) { v <- c(...); v }
test_that("drop_excluded_terms removes whole-term, case-insensitive exact matches", {
  tt <- list(c(humans = 5, animals = 4, medicine = 3, neoplasms = 2))
  out <- drop_excluded_terms(tt, c("humans", "animals", "science", "medicine"))
  expect_equal(names(out[[1]]), "neoplasms")
  expect_equal(unname(out[[1]]), 2)
})

test_that("drop_excluded_terms is case-insensitive and normalises underscores", {
  tt <- list(c(Humans = 5, Sports_Medicine = 4))   # underscore n-gram
  out <- drop_excluded_terms(tt, c("humans", "medicine"))
  expect_equal(names(out[[1]]), "Sports_Medicine")  # whole term != "medicine" -> kept
})

test_that("drop_excluded_terms does NOT do partial / nested matches", {
  tt <- list(c(medicine = 3, `sports medicine` = 2, `animal models` = 1))
  out <- drop_excluded_terms(tt, c("medicine", "animals"))
  expect_equal(sort(names(out[[1]])), sort(c("animal models", "sports medicine")))
})

test_that("drop_excluded_terms is a no-op with empty exclusions or empty cluster", {
  tt <- list(c(a = 1, b = 2), numeric(0))
  expect_equal(drop_excluded_terms(tt, character(0)), tt)
  expect_equal(length(drop_excluded_terms(tt, c("a"))[[2]]), 0)
})
