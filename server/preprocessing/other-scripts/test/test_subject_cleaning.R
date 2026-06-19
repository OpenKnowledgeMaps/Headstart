# Unit & integration tests for the MeSH keyword cleaning.
#
# Run from the other-scripts directory in a healthy renv, e.g.:
#   Rscript -e 'library(testthat); test_file("test/test_subject_cleaning.R")'
#
# base.R has top-level logging setup, so (as in test_base.R) utils.R must be
# sourced and logging initialised before base.R can be sourced.

library(testthat)

if (!exists("deinvert_marked_mesh_keywords")) {
  source("utils.R")
  setup_logging("INFO")
  source("base.R")
}

# The non-"timeline" MeSH slice of vis_layout's subject cleaning, in order.
mesh_clean <- function(s) {
  s <- deinvert_marked_mesh_keywords(s)        # de-invert (marker preserved)
  s <- remove_mesh_round_bracket_marker(s)     # strip "(mesh)"
  s <- remove_text_in_square_brackets_from_keywords(s)  # existing: strip "[MeSH]"
  trimws(s)
}

# --- marker removal ---------------------------------------------
test_that("the (mesh) marker is removed", {
  expect_equal(mesh_clean("Cooperative Behavior (mesh)"), "Cooperative Behavior")
})

test_that("the [MeSH] marker is removed (existing behaviour preserved)", {
  expect_equal(mesh_clean("Humans [MeSH]"), "Humans")
})

test_that("non-MeSH parentheses are NOT removed", {
  expect_equal(mesh_clean("Statistics (Mathematics)"), "Statistics (Mathematics)")
})

# --- de-inversion -----------------------------------------------
test_that("a single-comma MeSH term is de-inverted", {
  expect_equal(mesh_clean("Adaptation, Physiological [MeSH]"), "Physiological Adaptation")
})

test_that("a multi-comma MeSH term is reversed (A, B, C, D -> D C B A)", {
  expect_equal(mesh_clean("Leukemia, Lymphocytic, Chronic, B-Cell [MeSH]"),
               "B-Cell Chronic Lymphocytic Leukemia")
})

test_that("an untagged comma keyword is NOT de-inverted", {
  expect_equal(mesh_clean("Journalismus, Verlagswesen"), "Journalismus, Verlagswesen")
})

# --- Integration: I1, exclusion set honoured ---------------------------------
test_that("the reversal-exclusion set is honoured (kept in original order)", {
  old <- MESH_DEINVERSION_EXCLUSIONS
  on.exit(MESH_DEINVERSION_EXCLUSIONS <<- old)
  MESH_DEINVERSION_EXCLUSIONS <<- c("Aged, 80 and over")
  expect_equal(mesh_clean("Aged, 80 and over [MeSH]"), "Aged, 80 and over")
})
