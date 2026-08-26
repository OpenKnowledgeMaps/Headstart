# Unit tests for the label casing restoration (match_keyword_case /
# fix_keyword_casing) and the subject-side major-topic marker strip
# (strip_major_topic_markers) in summarize.R.
#
# Runs inside the pipeline image (summarize.R needs tm/stringr) — via
# test/run_tests.sh.

if (!exists("replay_labels")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

vocab <- function(...) {
  v <- c(...)
  setNames(rep(1, length(v)), v)
}

# --- match_keyword_case: casing only, never respelling ------------------------

test_that("a hyphenated token keeps its hyphen when a de-hyphenated twin exists", {
  expect_equal(match_keyword_case("rainfall-runoff",
                                  vocab("rainfall-runoff", "rainfallrunoff")),
               "rainfall-runoff")
})

test_that("exact-match casing restoration still works (control)", {
  expect_equal(match_keyword_case("rainfall-runoff", vocab("rainfall-runoff")),
               "rainfall-runoff")
  expect_equal(match_keyword_case("covid", vocab("COVID")), "COVID")
  expect_equal(match_keyword_case("sars-cov-2", vocab("SARS-CoV-2")), "SARS-CoV-2")
})

test_that("alphanumeric tokens are restored via the exact match", {
  expect_equal(match_keyword_case("3d", vocab("3D")), "3D")
  expect_equal(match_keyword_case("t2", vocab("T2")), "T2")
})

test_that("edge hyphens are trimmed before the lookup", {
  expect_equal(match_keyword_case("-runoff", vocab("runoff")), "runoff")
  expect_equal(match_keyword_case("rainfall-", vocab("rainfall")), "rainfall")
})

test_that("a token whose only vocabulary form is de-hyphenated keeps its own spelling", {
  expect_equal(match_keyword_case("rainfall-runoff", vocab("rainfallrunoff")),
               "rainfall-runoff")
})

test_that("unmatched, empty and hyphen-only tokens pass through", {
  expect_equal(match_keyword_case("unseen", vocab("other")), "unseen")
  expect_equal(match_keyword_case("", vocab("other")), "")
  expect_equal(match_keyword_case("-", vocab("other")), "-")
})

# --- fix_keyword_casing: label-level integration ------------------------------

test_that("a label term keeps interior hyphens through casing restoration", {
  expect_equal(fix_keyword_casing("rainfall-runoff models",
                                  vocab("rainfall-runoff", "rainfallrunoff", "models")),
               "Rainfall-runoff models")
})

# --- strip_major_topic_markers ------------------------------------------------

test_that("a leading major-topic '*' is stripped per keyword", {
  expect_equal(strip_major_topic_markers("*Artificial Intelligence; Humans; *Research Design"),
               "Artificial Intelligence; Humans; Research Design")
})

test_that("interior asterisks are kept", {
  expect_equal(strip_major_topic_markers("2*2 factorial design"), "2*2 factorial design")
})

test_that("plain subjects are untouched", {
  s <- "Artificial Intelligence; Decision Support Systems"
  expect_equal(strip_major_topic_markers(s), s)
})
