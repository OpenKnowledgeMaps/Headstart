# Unit & integration tests for the subject/keyword cleaning.
#
# Run from the other-scripts directory, e.g.:
#   Rscript -e 'library(testthat); test_file("test/test_subject_cleaning.R")'
#
# subject_cleaning.R is pure base R (no packages, no logging), so it can be
# sourced and tested in isolation.

library(testthat)

if (!exists("deinvert_marked_mesh_keywords")) {
  source("subject_cleaning.R")
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

# --- classification cleanup --------------------------------------------------
# Each classification keyword is dropped whole; the neighbour "cooperation" is
# kept, verifying removal with no side-effect on adjacent keywords.
drops_to_cooperation <- function(keyword) {
  expect_equal(clean_classification_keywords(paste0(keyword, "; cooperation")), "cooperation")
}

test_that("name= key-value keywords are dropped", {
  drops_to_cooperation("name=Connected World")
})
test_that("rcdc keywords are dropped", {
  drops_to_cooperation("Autism (rcdc)")
})
test_that("'not elsewhere classified' keywords are dropped", {
  drops_to_cooperation("Biological Sciences not elsewhere classified")
})
test_that("FoR keywords are dropped (all serialisations)", {
  drops_to_cooperation("01 Mathematical Sciences (for)")
  drops_to_cooperation("38 Economics (for-2020)")
  drops_to_cooperation("FoR 03 (Chemical Sciences)")
  drops_to_cooperation("anzsrc-for: 3402 Inorganic Chemistry")
  drops_to_cooperation("anzsrc-for: 34 Chemical Sciences")
  drops_to_cooperation("anzsrc-for: 03 Chemical Sciences")
})
test_that("hrcs keywords are dropped", {
  drops_to_cooperation("2.1 Biological and endogenous factors (hrcs-rac)")
})
test_that("science-metrix keywords are dropped", {
  drops_to_cooperation("Bioinformatics (science-metrix)")
})
test_that("sdg keywords are dropped (suffix marker + numbered prefix)", {
  drops_to_cooperation("3 Good Health and Well Being (sdg)")
  drops_to_cooperation("SDG 10: Reduced inequalities")
  drops_to_cooperation("SDG 3: Good health and well-being")
})
test_that("ACM CCS keywords are dropped", {
  drops_to_cooperation("Computing methodologies → Machine learning")
})
test_that("HAL domain keywords are dropped", {
  drops_to_cooperation("[SHS.ECO]Humanities and Social Sciences/Economics and Finance")
  drops_to_cooperation("[SDV]Life Sciences [q-bio]")
})
test_that("URL keywords are dropped", {
  drops_to_cooperation("https://cdn.jamanetwork.com/x.pdf")
})
test_that("numeric path keywords are dropped", {
  drops_to_cooperation("/692/308/174")
})
test_that("Toulouse letter-domain subjects are dropped (top level + sub-categories)", {
  drops_to_cooperation("B- ECONOMIE ET FINANCE")
  drops_to_cooperation("A1-4- Droit de l'informatique")
  drops_to_cooperation("4-2- Droit des affaires – droit commercial")
})

# Guards: real keywords that look classification-ish must be kept.
test_that("look-alike keywords are NOT dropped", {
  for (kw in c("J-PET", "for 1347 (89.8%)", "COVID-19/diagnosis",
               "Statistics (Mathematics)", "Mixed/Augmented Reality", "[SHSX]not-a-code",
               "2138", "B-cell lymphoma", "Marketing", "SDGs in practice")) {
    expect_equal(clean_classification_keywords(kw), kw)
  }
})
