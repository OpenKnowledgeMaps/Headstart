# Regression for the replace_keywords_if_empty routing fix.
#
# replace_keywords_if_empty synthesises a `subject` from the title for papers with
# no real keywords, and flags them via `subject_is_heuristic`. Those synthesised
# "keywords" are title n-grams, so the ranking must route them to the HEURISTIC
# rank source (rank 2), NOT the cleaned/keyword source (rank 1) — otherwise title
# fragments outrank real keywords (the "Action changing, Action ethics" case).
#
# Runs inside the pipeline image (needs tm).

if (!exists("get_cluster_corpus")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

STOPS <- c("the", "for", "a", "in", "of", "and", "to")

build_md <- function() {
  md <- data.frame(
    # paper 1: real author keywords, title unrelated to them (non-flagged)
    # paper 2: keyword-less -> subject SYNTHESISED from its title (flagged)
    title   = c("Alpha beta gamma delta", "Taking action in a changing world"),
    subject = c("neural networks; deep learning", "action changing; taking action"),
    paper_abstract = c("", ""),
    subject_is_heuristic = c(FALSE, TRUE),
    stringsAsFactors = FALSE)
  add_heuristic_keyword_fields(md, STOPS)
}

test_that("a real keyword lands in rank 1 (cleaned), not rank 2", {
  md <- build_md()
  co <- get_cluster_corpus(list(groups = c(1, 1), num_clusters = 1),
                           md, STOPS, taxonomy_separator = NULL, heuristic_col = HEUR_MIN2)
  cleaned <- co$rank_sources$cleaned[[1]]; heur <- co$rank_sources$heuristic[[1]]
  expect_true("neural_networks" %in% cleaned)
  expect_false("neural_networks" %in% heur)
})

test_that("a title-synthesised subject lands in rank 2 (heuristic), not rank 1", {
  md <- build_md()
  co <- get_cluster_corpus(list(groups = c(1, 1), num_clusters = 1),
                           md, STOPS, taxonomy_separator = NULL, heuristic_col = HEUR_MIN2)
  cleaned <- co$rank_sources$cleaned[[1]]; heur <- co$rank_sources$heuristic[[1]]
  expect_true("taking_action" %in% heur)
  expect_false("taking_action" %in% cleaned)
  expect_false("action_changing" %in% cleaned)
})

test_that("without the flag column, all subjects stay in rank 1 (backward compatible)", {
  md <- build_md(); md$subject_is_heuristic <- NULL   # simulate a pre-fix fixture
  co <- get_cluster_corpus(list(groups = c(1, 1), num_clusters = 1),
                           md, STOPS, taxonomy_separator = NULL, heuristic_col = HEUR_MIN2)
  cleaned <- co$rank_sources$cleaned[[1]]
  expect_true("neural_networks" %in% cleaned)
  expect_true("taking_action" %in% cleaned)   # unflagged -> treated as keyword, as before
})
