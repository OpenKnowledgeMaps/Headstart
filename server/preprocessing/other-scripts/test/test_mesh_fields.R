# Unit tests for add_mesh_rank_fields (mesh_fields.R): production of the MeSH
# specific/generic rank-provenance columns from the raw [MeSH]-marked subject_orig.
# Needs the classifier resource files (mesh_tree_depth.tsv / mesh_check_tags.txt), so
# it runs inside the pipeline image; pure base R otherwise.

if (!exists("add_mesh_rank_fields")) source("mesh_fields.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

md <- data.frame(
  subject_orig = c(
    "Neoplasms [MeSH]; Humans [MeSH]; Breast Neoplasms [MeSH]; Cancer research",
    "History, 21st Century [MeSH]; Autistic Disorder/genetics [MeSH]",
    "just; plain; keywords",
    NA_character_),
  stringsAsFactors = FALSE)
out <- add_mesh_rank_fields(md)
splitc <- function(s) strsplit(s, "; ", fixed = TRUE)[[1]]

test_that("adds the two additive columns without dropping rows", {
  expect_true(all(c(KW_MESH_SPECIFIC, KW_MESH_GENERIC) %in% names(out)))
  expect_equal(nrow(out), 4)
})

test_that("check-tags and shallow MeSH -> generic; deeper MeSH -> specific", {
  gen  <- splitc(out[[KW_MESH_GENERIC]][1])
  spec <- splitc(out[[KW_MESH_SPECIFIC]][1])
  expect_true("Humans" %in% gen)             # check tag -> generic
  expect_true("Neoplasms" %in% gen)          # tree depth <= 2 -> generic
  expect_true("Breast Neoplasms" %in% spec)  # deeper -> specific
})

test_that("stored form is de-inverted (comma-terms) and qualifier-stripped", {
  all2 <- c(splitc(out[[KW_MESH_GENERIC]][2]), splitc(out[[KW_MESH_SPECIFIC]][2]))
  expect_true("21st Century History" %in% all2)   # "History, 21st Century" de-inverted
  expect_true("Autistic Disorder" %in% all2)      # "/genetics" qualifier stripped
})

test_that("non-MeSH keywords and NA subjects yield empty columns", {
  expect_equal(out[[KW_MESH_SPECIFIC]][3], "")   # plain keywords -> no mesh
  expect_equal(out[[KW_MESH_GENERIC]][3], "")
  expect_equal(out[[KW_MESH_SPECIFIC]][4], "")   # NA subject_orig
})

test_that("absent subject_orig -> empty columns (Modes 2/3 degrade to Mode 1)", {
  o2 <- add_mesh_rank_fields(data.frame(title = c("a", "b"), stringsAsFactors = FALSE))
  expect_true(all(o2[[KW_MESH_SPECIFIC]] == ""))
  expect_true(all(o2[[KW_MESH_GENERIC]] == ""))
})
