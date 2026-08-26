# Unit tests for the corpus-side text hygiene: HTML entity decoding
# (decode_html_entities) and URL/HTML/noise stripping (sanitize_corpus_noise)
# in summarize.R, plus their integration into ngram_candidates.
#
# Runs inside the pipeline image (summarize.R needs tm/stringr) — via
# test/run_tests.sh.

if (!exists("replay_labels")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

# --- decode_html_entities -----------------------------------------------------

test_that("numeric entities decode and dashes normalise to '-'", {
  expect_equal(decode_html_entities("Rainfall&#8211;Runoff"), "Rainfall-Runoff")
})

test_that("hex entities decode", {
  expect_equal(decode_html_entities("a&#x2013;b"), "a-b")
})

test_that("non-breaking space becomes a plain space", {
  expect_equal(decode_html_entities("Ma&#160;na"), "Ma na")
  expect_equal(decode_html_entities("nonconformity&nbsp;"), "nonconformity ")
})

test_that("named entities decode; double-encoded unwraps one level only", {
  expect_equal(decode_html_entities("&lt;q&gt;"), "<q>")
  expect_equal(decode_html_entities("A &amp; B"), "A & B")
  expect_equal(decode_html_entities("&amp;lt;"), "&lt;")
})

test_that("non-entity ampersands and hashes are untouched", {
  expect_equal(decode_html_entities("AT&T research"), "AT&T research")
  expect_equal(decode_html_entities("C# programming"), "C# programming")
})

test_that("non-ASCII text passes through unchanged", {
  s <- c("Künstliche Intelligenz", "Штучний інтелект", "Außerschulische Tätigkeit")
  expect_equal(decode_html_entities(s), s)
})

test_that("bare unicode dashes normalise to '-'", {
  expect_equal(decode_html_entities("rainfall–runoff"), "rainfall-runoff")
  expect_equal(decode_html_entities("rainfall‐runoff"), "rainfall-runoff")
})

# --- sanitize_corpus_noise ----------------------------------------------------

test_that("URLs and signed-URL fragments are removed, words around them kept", {
  out <- sanitize_corpus_noise("see https://covid19-phenomics.org/OurRiskCoV.html for context")
  expect_false(grepl("http|phenomics", out))
  expect_true(grepl("see", out) && grepl("for context", out))
  out2 <- sanitize_corpus_noise("data public/journal/x/7/2/file.zip?sig=1&key-pair-id=APKAI here")
  expect_false(grepl("key-pair-id", out2))
  expect_true(grepl("here", out2))
})

test_that("HTML tags and stray closing fragments are removed", {
  expect_false(grepl("<q>", sanitize_corpus_noise("the <q>unit hydrograph</q> method"), fixed = TRUE))
  expect_true(grepl("unit hydrograph", sanitize_corpus_noise("the <q>unit hydrograph</q> method")))
  expect_equal(trimws(sanitize_corpus_noise("uganda </ p")), "uganda")
})

test_that("over-long no-space tokens are removed", {
  junk <- paste(rep("x", 120), collapse = "")
  out <- sanitize_corpus_noise(paste("keep", junk, "this"))
  expect_false(grepl("xxxxx", out))
  expect_true(grepl("keep", out) && grepl("this", out))
})

test_that("digit-bearing phrases are untouched by the sanitizer", {
  s <- "type 2 diabetes and covid-19"
  expect_equal(sanitize_corpus_noise(s), s)
})

# --- ngram_candidates integration ---------------------------------------------

test_that("an entity-carrying title yields the hyphenated token, not digit residue", {
  out <- ngram_candidates("Rainfall&#8211;Runoff Modeling", c("and", "the"))
  expect_true("Rainfall-Runoff_Modeling" %in% out)
  expect_false(any(grepl("8211", out)))
})

test_that("an abstract URL never becomes a candidate token", {
  out <- ngram_candidates("risk information at https://example.org/page provided online",
                          c("at", "the"), include_unigrams = TRUE)
  expect_false(any(grepl("https|example", out)))
})
