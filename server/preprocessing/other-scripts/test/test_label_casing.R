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

test_that("a trailing major-topic '*' is stripped per keyword", {
  expect_equal(strip_major_topic_markers("Genome-Wide Association Study*; Humans"),
               "Genome-Wide Association Study; Humans")
  expect_equal(strip_major_topic_markers("Humans; Raynaud Disease*"),
               "Humans; Raynaud Disease")
})

test_that("interior asterisks are kept", {
  expect_equal(strip_major_topic_markers("2*2 factorial design"), "2*2 factorial design")
})

test_that("plain subjects are untouched", {
  s <- "Artificial Intelligence; Decision Support Systems"
  expect_equal(strip_major_topic_markers(s), s)
})

# --- match_keyword_case: guarded-majority variant pick ------------------------
#
# The pick used to take the FIRST variant in locale collation order and ignore
# the counts entirely, so under en_US.UTF-8 the lowercase form won whatever the
# evidence said (HIV 806 lost to hiv 3). The rule below uses the counts, with
# two guards, and breaks ties on count-then-string so the result does not depend
# on the collation locale.

# A vocabulary with explicit counts: vocab_n(HIV = 806, hiv = 3).
vocab_n <- function(...) c(...)

test_that("the most frequent variant wins over a rare lowercase twin", {
  expect_equal(match_keyword_case("hiv", vocab_n(HIV = 806, hiv = 3)), "HIV")
  expect_equal(match_keyword_case("covid-19", vocab_n(`COVID-19` = 324, `covid-19` = 8)),
               "COVID-19")
  expect_equal(match_keyword_case("lstm", vocab_n(LSTM = 106, Lstm = 1)), "LSTM")
})

test_that("a one-occurrence misspelling loses to the attested variant", {
  expect_equal(match_keyword_case("sars-cov-2",
                                  vocab_n(`SARS-CoV-2` = 85, `SARs-CoV-2` = 1)),
               "SARS-CoV-2")
})

test_that("a non-lowercase variant needs twice the lowercase count to displace it", {
  # 140 Titlecase against 196 lowercase: not enough, the word stays lowercase.
  expect_equal(match_keyword_case("health", vocab_n(health = 196, Health = 140)), "health")
  # Exactly 2x displaces; one short of it does not.
  expect_equal(match_keyword_case("word", vocab_n(word = 10, Word = 20)), "Word")
  expect_equal(match_keyword_case("word", vocab_n(word = 10, Word = 19)), "word")
})

test_that("a single-occurrence ALL-CAPS variant yields to the best mixed variant", {
  # One shouting title must not set the casing for the whole map.
  expect_equal(match_keyword_case("token", vocab_n(TOKEN = 1, Token = 1)), "Token")
})

test_that("an ALL-CAPS variant seen more than once wins", {
  # DECIDED 2026-09-16: the guard fires only at count == 1. A variant attested
  # twice or more sets the casing even against a mixed-case twin, so a single
  # ALL-CAPS title contributing a repeated token can still shout. Accepted
  # trade-off: the alternative (a <5 attestation floor) was measured to change
  # 10 tokens across the replay corpus and was not chosen.
  expect_equal(match_keyword_case("dimensionality",
                                  vocab_n(DIMENSIONALITY = 3, Dimensionality = 1)),
               "DIMENSIONALITY")
  expect_equal(match_keyword_case("unlabelled",
                                  vocab_n(UNLABELLED = 2, Unlabelled = 1)),
               "UNLABELLED")
})

test_that("the pick does not depend on the order of the vocabulary", {
  expect_equal(match_keyword_case("hiv", vocab_n(hiv = 3, HIV = 806)),
               match_keyword_case("hiv", vocab_n(HIV = 806, hiv = 3)))
  # A count tie is broken on the string, not on locale collation.
  expect_equal(match_keyword_case("alpha", vocab_n(Alpha = 5, ALPHA = 5)),
               match_keyword_case("alpha", vocab_n(ALPHA = 5, Alpha = 5)))
})

test_that("a word with only a lowercase form stays lowercase", {
  expect_equal(match_keyword_case("models", vocab_n(models = 12)), "models")
})

test_that("a word with a single non-lowercase form takes it", {
  expect_equal(match_keyword_case("frauenberger", vocab_n(Frauenberger = 135)),
               "Frauenberger")
})
