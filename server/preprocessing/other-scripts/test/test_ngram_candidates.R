# Unit tests for the shared heuristic n-gram builder (ngram_candidates,
# summarize.R) and its use in the last-resort fallback label
# (title_abstract_fallback_label). The builder keeps digits and intra-word
# hyphens and forms n-grams on the stopword-retaining stream, pruning only
# boundary-stopword n-grams.
#
# Runs inside the pipeline image (summarize.R needs tm/stringr) — via
# test/run_tests.sh.

if (!exists("replay_labels")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

STOPS <- c("and", "in", "the", "of", "to", "big", "on", "for", "a")

test_that("digit-bearing tokens stay whole", {
  out <- ngram_candidates("covid-19 cardiovascular diseases", STOPS)
  expect_true("covid-19_cardiovascular_diseases" %in% out)
  expect_false(any(grepl("(^|_)covid(_|$)", out)))   # no digit-stripped bare covid
})

test_that("mid-token digits survive (no 'st' fragment)", {
  out <- ngram_candidates("communication in the 21st century", STOPS)
  expect_true("21st_century" %in% out)
  expect_false(any(grepl("(^|_)st(_|$)", out)))
})

test_that("interior stopwords are kept, fused bigrams never formed", {
  out <- ngram_candidates("biomedical big data", STOPS)
  expect_true("biomedical_big_data" %in% out)
  expect_false("biomedical_data" %in% out)
  expect_false("biomedical_big" %in% out)   # ends with a stopword
  expect_false("big_data" %in% out)         # starts with a stopword
})

test_that("interior stopword phrase survives as a trigram", {
  out <- ngram_candidates("approach to monitor", STOPS)
  expect_true("approach_to_monitor" %in% out)
  expect_false("approach_to" %in% out)
  expect_false("to_monitor" %in% out)
})

test_that("stopword handling is case-insensitive (same result for both casings)", {
  a <- ngram_candidates("Biomedical Big Data", STOPS)
  b <- ngram_candidates("biomedical big data", STOPS)
  expect_equal(tolower(a), tolower(b))
})

test_that("unigrams drop stopwords and purely numeric tokens", {
  out <- ngram_candidates("published in 2020", STOPS, ngram_lengths = 2,
                          include_unigrams = TRUE)
  expect_true("published" %in% out)
  expect_false("2020" %in% out)
  expect_false("in" %in% out)
})

test_that("digits inside an n-gram are kept (only standalone numbers are noise)", {
  out <- ngram_candidates("2021 german federal election", STOPS)
  expect_true("2021_german_federal" %in% out | "2021_german" %in% out)
})

test_that("empty, NA and all-stopword input yield empty output without error", {
  expect_equal(ngram_candidates("", STOPS), character(0))
  expect_equal(ngram_candidates(NA, STOPS), character(0))
  expect_equal(ngram_candidates("the of and", STOPS), character(0))
})

# --- title_abstract_fallback_label integration --------------------------------

test_that("the fallback label keeps interior stopwords and digit tokens", {
  metadata <- data.frame(
    title = c("Biomedical big data opportunities",
              "Biomedical big data challenges"),
    paper_abstract = c("", ""),
    stringsAsFactors = FALSE)
  label <- title_abstract_fallback_label(1:2, metadata, STOPS, top_n = 3)
  expect_true(grepl("biomedical big data", label, fixed = TRUE))
  expect_false(grepl("biomedical data", label, fixed = TRUE))
})

test_that("the fallback label survives an all-stopword cluster", {
  metadata <- data.frame(title = c("the of and"), paper_abstract = c(""),
                         stringsAsFactors = FALSE)
  expect_equal(title_abstract_fallback_label(1, metadata, STOPS), "")
})
