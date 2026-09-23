# Unit tests for the shared MeSH specific/generic classifier (mesh_classification.R).
#
# Pure base R; loads the tree/check-tag artifacts from resources/. If those are not
# present (e.g. a container image built before they were added), the tests skip.

if (!exists("classify_mesh")) source("mesh_classification.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

.have_mesh <- tryCatch({ load_mesh_resources(); TRUE }, error = function(e) FALSE)

if (!.have_mesh) {
  cat("  (mesh resources not found in resources/ — skipping MeSH classifier tests)\n")
} else {

  # --- check tags are generic regardless of tree depth ------------------------
  test_that("check tags are generic even when their tree depth is deep", {
    expect_true(is_generic_mesh("Humans"))     # tree depth 11, but a check tag
    expect_true(is_generic_mesh("Animals"))
    expect_true(is_generic_mesh("Male"))
    expect_true(is_generic_mesh("Female"))
    expect_true(mesh_min_depth("Humans") > MESH_GENERIC_MAX_DEPTH)  # depth alone wouldn't
  })

  # --- shallow tree depth (<= 2) is generic -----------------------------------
  test_that("descriptors at min tree depth <= 2 are generic", {
    expect_true(is_generic_mesh("Neoplasms"))            # depth 1
    expect_true(is_generic_mesh("Game Theory"))          # depth 2
    expect_true(is_generic_mesh("Biological Evolution")) # depth 2 (multi-location, min 2)
  })

  # --- deeper descriptors are specific ----------------------------------------
  test_that("descriptors at min tree depth > 2 are specific", {
    expect_false(is_generic_mesh("Breast Neoplasms"))    # depth 3
    expect_false(is_generic_mesh("A549 Cells"))          # depth 3
  })

  # --- unknown descriptors default to specific --------------------------------
  test_that("descriptors not in the tree default to specific (never demoted)", {
    expect_false(is_generic_mesh("Depressive Disorder, Major"))  # comma-truncation artifact
    expect_false(is_generic_mesh("Zzzz Not A Real Descriptor"))
    expect_true(is.na(mesh_min_depth("Zzzz Not A Real Descriptor")))
  })

  # --- lookup is on the ORIGINAL (non-de-inverted) form, case-insensitive ------
  test_that("lookup uses the original MeSH form, case-insensitively", {
    expect_true(is_generic_mesh("Adaptation, Physiological"))   # original form, depth 2
    expect_true(is_generic_mesh("adaptation, physiological"))   # case-insensitive
    # the de-inverted form is NOT in the tree -> classify BEFORE de-inverting
    expect_false(is_generic_mesh("Physiological Adaptation"))
  })

  # --- classify_mesh is vectorised --------------------------------------------
  test_that("classify_mesh vectorises to generic/specific", {
    expect_equal(classify_mesh(c("Humans", "Breast Neoplasms", "Neoplasms")),
                 c("generic", "specific", "generic"))
  })
}
