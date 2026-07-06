# Unit tests for the per-integration ranking-mode config resolver (ranking.R).
#
# Run via test/run_tests.R (from the other-scripts directory). ranking.R is pure
# base R, so it is sourced and tested in isolation.
#
# Covers the config surface (§8) and edge case §15-13 of
# docs/area_title_ranking_plan.md: unset, per-integration override, global
# fallback, precedence, case-insensitivity, and invalid/misconfigured values.

if (!exists("ranking_mode")) {
  source("ranking.R")
}

# Clear every RANKING_MODE* var so each test starts from a known-empty env.
clear_ranking_env <- function() {
  vars <- names(Sys.getenv())
  vars <- vars[startsWith(vars, "RANKING_MODE")]
  if (length(vars)) Sys.unsetenv(vars)
}

# --- default / unset ---------------------------------------------------------
test_that("unset env with no service defaults to mode 0", {
  clear_ranking_env()
  expect_equal(ranking_mode(), "0")
})

test_that("unset env with a service still defaults to mode 0", {
  clear_ranking_env()
  expect_equal(ranking_mode("base"), "0")
})

test_that("NULL and empty service are treated the same as no service", {
  clear_ranking_env()
  Sys.setenv(RANKING_MODE = "1")
  expect_equal(ranking_mode(NULL), "1")
  expect_equal(ranking_mode(""), "1")
})

# --- global RANKING_MODE -----------------------------------------------------
test_that("a valid global RANKING_MODE is honoured", {
  clear_ranking_env()
  Sys.setenv(RANKING_MODE = "2")
  expect_equal(ranking_mode(), "2")
  expect_equal(ranking_mode("orcid"), "2")   # no per-integration override -> global
})

# --- per-integration override ------------------------------------------------
test_that("a per-integration override is used for its service", {
  clear_ranking_env()
  Sys.setenv(RANKING_MODE_BASE = "1")
  expect_equal(ranking_mode("base"), "1")
})

test_that("per-integration override beats the global default", {
  clear_ranking_env()
  Sys.setenv(RANKING_MODE = "0", RANKING_MODE_PUBMED = "2")
  expect_equal(ranking_mode("pubmed"), "2")   # override wins
  expect_equal(ranking_mode("base"), "0")     # other services fall back to global
})

test_that("service lookup is case-insensitive", {
  clear_ranking_env()
  Sys.setenv(RANKING_MODE_BASE = "3")
  expect_equal(ranking_mode("base"), "3")
  expect_equal(ranking_mode("BASE"), "3")
  expect_equal(ranking_mode("Base"), "3")
})

test_that("different integrations can run different modes simultaneously", {
  clear_ranking_env()
  Sys.setenv(RANKING_MODE_PUBMED = "2", RANKING_MODE_BASE = "0")
  expect_equal(ranking_mode("pubmed"), "2")
  expect_equal(ranking_mode("base"), "0")
  expect_equal(ranking_mode("orcid"), "0")    # unset -> default
})

# --- invalid / misconfigured values fall back safely to 0 --------------------
test_that("an invalid global value falls back to mode 0", {
  clear_ranking_env()
  Sys.setenv(RANKING_MODE = "5")
  expect_equal(ranking_mode(), "0")
  Sys.setenv(RANKING_MODE = "banana")
  expect_equal(ranking_mode("base"), "0")
})

test_that("an invalid per-integration value falls through to a valid global", {
  clear_ranking_env()
  Sys.setenv(RANKING_MODE = "2", RANKING_MODE_BASE = "banana")
  expect_equal(ranking_mode("base"), "2")     # invalid override ignored, global used
})

test_that("invalid at both levels yields mode 0", {
  clear_ranking_env()
  Sys.setenv(RANKING_MODE = "9", RANKING_MODE_BASE = "x")
  expect_equal(ranking_mode("base"), "0")
})

clear_ranking_env()
