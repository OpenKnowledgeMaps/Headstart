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

# --- MeSH qualifier (subheading) stripping -----------------------------------
test_that("MeSH subheading qualifiers are stripped, descriptor kept", {
  expect_equal(strip_mesh_qualifier("Autistic Disorder/genetics"), "Autistic Disorder")
  expect_equal(strip_mesh_qualifier("Pain / complications"), "Pain")
  expect_equal(strip_mesh_qualifier("Bed Occupancy/statistics & numerical data"), "Bed Occupancy")
  expect_equal(strip_mesh_qualifier("COVID-19/*epidemiology"), "COVID-19")
  expect_equal(strip_mesh_qualifier("Hospitals/*supply & distribution"), "Hospitals")
  expect_equal(strip_mesh_qualifier("COVID-19/diagnosis"), "COVID-19")
})
test_that("the major-topic '*' marker is trimmed from the descriptor", {
  expect_equal(strip_mesh_qualifier("Raynaud Disease* / genetics"), "Raynaud Disease")
})
test_that("a '*' marker after the qualifier is handled", {
  expect_equal(strip_mesh_qualifier("Lung Neoplasms/genetics*"), "Lung Neoplasms")
  expect_equal(strip_mesh_qualifier("Anti-Inflammatory Agents/pharmacology*"), "Anti-Inflammatory Agents")
  expect_equal(strip_mesh_qualifier("Antimutagenic Agents / pharmacology*"), "Antimutagenic Agents")
})
test_that("the ' - ' (spaced dash) separator is handled", {
  expect_equal(strip_mesh_qualifier("Acyltransferases - genetics"), "Acyltransferases")
  expect_equal(strip_mesh_qualifier("ATP-Binding Cassette Transporters - antagonists & inhibitors"),
               "ATP-Binding Cassette Transporters")
  expect_equal(
    strip_mesh_qualifier("Adrenergic Alpha-Agonists - Antagonists & Inhibitors - Pharmacology"),
    "Adrenergic Alpha-Agonists")
})
test_that("hyphenated descriptors are not split by the dash separator", {
  for (kw in c("B-cell lymphoma", "Self-Esteem", "Brain - Computer Interface")) {
    expect_equal(strip_mesh_qualifier(kw), kw)
  }
})
test_that("space-delimited MeSH blobs are split at qualifier boundaries", {
  expect_equal(
    strip_mesh_qualifier("CXC/*antagonists & inhibitors/metabolism Chemotaxis/drug effects Docosahexaenoic Acids/pharmacology"),
    "CXC; Chemotaxis; Docosahexaenoic Acids")
  expect_equal(
    strip_mesh_qualifier("Cell Cycle Proteins/*genetics Cell Line"),
    "Cell Cycle Proteins; Cell Line")
})
test_that("a '*' major-topic marker also starts a new heading", {
  expect_equal(strip_mesh_qualifier("Cytokines/immunology *Immunity"), "Cytokines; Immunity")
})
test_that("a stacked qualifier run splits even before a lower-case heading", {
  # next heading is a gene name "rab3A" (lower-case); the 2+ qualifier stack is
  # still unambiguous, so it splits and strips.
  expect_equal(
    strip_mesh_qualifier("Spermatozoa/cytology/drug effects/metabolism rab3A GTP-Binding Protein"),
    "Spermatozoa; rab3A GTP-Binding Protein")
})
test_that("headings concatenated with no delimiter are split at the qualifier", {
  expect_equal(
    strip_mesh_qualifier("Adrenergic beta-Antagonists/therapeutic useCalcium Channel Blockers/therapeutic use"),
    "Adrenergic beta-Antagonists; Calcium Channel Blockers")
})
test_that("qualifier-less headings stay merged (under-split, never wrongly broken)", {
  # "Animals" has no qualifier to anchor on, so it stays glued to its neighbour.
  expect_equal(strip_mesh_qualifier("Animals Cell Cycle Proteins/*genetics Cell Line"),
               "Animals Cell Cycle Proteins; Cell Line")
})
test_that("a qualifier word inside a compound is not a blob boundary", {
  # "/economics" is followed by lowercase "policy", so it is a compound, not a pair.
  expect_equal(strip_mesh_qualifier("Health/economics policy"), "Health/economics policy")
})
test_that("a qualifier behind a MeSH marker is stripped (marker removed first, as in base.R)", {
  # base.R strips [MeSH]/(mesh) before strip_mesh_qualifier, so the qualifier is no
  # longer hidden behind the marker at the heading boundary.
  s <- "Acetophenones/therapeutic use [MeSH]"
  s <- remove_text_in_square_brackets_from_keywords(s)
  expect_equal(strip_mesh_qualifier(s), "Acetophenones")
})
test_that("the colon form is stripped in isolation (live pipeline removes it earlier)", {
  expect_equal(strip_mesh_qualifier("Hypothermia: chemically induced"), "Hypothermia")
})
test_that("stacked qualifiers are all stripped", {
  expect_equal(strip_mesh_qualifier("Hypothermia/diagnosis/therapy"), "Hypothermia")
})
test_that("qualifier stripping acts per keyword within a subject", {
  expect_equal(
    strip_mesh_qualifier("Autistic Disorder/genetics; cooperation; Pain / complications"),
    "Autistic Disorder; cooperation; Pain")
})
test_that("non-qualifier tails are left untouched", {
  for (kw in c("Mixed/Augmented Reality", "Speech/Language", "Input/Output",
               "Cost/benefit analysis")) {
    expect_equal(strip_mesh_qualifier(kw), kw)
  }
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
