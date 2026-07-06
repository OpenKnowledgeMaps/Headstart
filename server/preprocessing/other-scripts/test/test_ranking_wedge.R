# Unit tests for the ranking-mode selection wedge (ranking.R).
#
# Run via test/run_tests.R (from the other-scripts directory). We inject a stub
# `legacy_fn` so the wedge can be tested in isolation, without the tm stack or
# summarize.R.
#
# Stage 0 invariant: the wedge is a NO-OP — Mode 0 uses the legacy selection, and
# Modes 1-3 (not yet implemented) also fall back to it. When Stage 1 lands, the
# Mode 1-3 cases below become the first behaviour to change, so these tests pin
# the current contract and will flag that change.

if (!exists("select_cluster_label_names")) {
  source("ranking.R")
}

# A recording stub standing in for get_top_names: counts calls and captures the
# arguments it was passed, and returns a sentinel value.
make_stub <- function(ret = "STUB_LABELS") {
  state <- new.env(parent = emptyenv())
  state$n <- 0L
  state$last <- NULL
  fn <- function(tfidf_top, top_n, stops) {
    state$n <- state$n + 1L
    state$last <- list(tfidf_top = tfidf_top, top_n = top_n, stops = stops)
    ret
  }
  list(fn = fn, state = state)
}

TT <- list(c(a = 3, b = 2), c(x = 1))   # dummy per-cluster tf-idf term lists
STOPS <- c("the", "of")

# --- Mode 0: pure legacy pass-through ----------------------------------------
test_that("mode 0 delegates to the legacy selector unchanged", {
  s <- make_stub()
  out <- select_cluster_label_names(TT, top_n = 3, stops = STOPS, mode = "0", legacy_fn = s$fn)
  expect_equal(out, "STUB_LABELS")
  expect_equal(s$state$n, 1L)
})

test_that("mode 0 forwards its arguments to the legacy selector verbatim", {
  s <- make_stub()
  select_cluster_label_names(TT, top_n = 3, stops = STOPS, mode = "0", legacy_fn = s$fn)
  expect_identical(s$state$last$tfidf_top, TT)
  expect_equal(s$state$last$top_n, 3)
  expect_identical(s$state$last$stops, STOPS)
})

# --- Stage 0: modes 1-3 fall back to legacy (behaviour changes in Stage 1) ----
test_that("modes 1-3 fall back to the legacy selector in Stage 0", {
  for (m in c("1", "2", "3")) {
    s <- make_stub()
    out <- suppressWarnings(
      select_cluster_label_names(TT, top_n = 3, stops = STOPS, mode = m, legacy_fn = s$fn))
    expect_equal(out, "STUB_LABELS")
    expect_equal(s$state$n, 1L)
  }
})

# --- Integration with the config resolver ------------------------------------
test_that("a per-integration mode resolves and (Stage 0) still uses legacy", {
  old <- Sys.getenv("RANKING_MODE_BASE", unset = NA)
  on.exit(if (is.na(old)) Sys.unsetenv("RANKING_MODE_BASE") else Sys.setenv(RANKING_MODE_BASE = old))
  Sys.setenv(RANKING_MODE_BASE = "1")
  mode <- ranking_mode("base")
  expect_equal(mode, "1")
  s <- make_stub()
  out <- suppressWarnings(
    select_cluster_label_names(TT, top_n = 3, stops = STOPS, mode = mode, legacy_fn = s$fn))
  expect_equal(out, "STUB_LABELS")   # Stage 0: still legacy
  expect_equal(s$state$n, 1L)
})
