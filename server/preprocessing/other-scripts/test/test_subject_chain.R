# Tests for the full BASE subject-cleaning chain (clean_subject_string) and the
# DOAJ LCC caption/code block removal (drop_doaj_lcc_pairs).
#
# Run via the test runner (from the other-scripts directory):
#   Rscript test/run_tests.R test/test_subject_chain.R
#
# subject_cleaning.R is dependency-free base R (stringi is optional), so this
# file runs on a bare host as well as inside the pipeline image.

if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

if (!exists("clean_subject_string")) {
  source("subject_cleaning.R")
}

chain <- function(s, vis_type = NULL, doaj = FALSE) {
  clean_subject_string(s, vis_type, doaj)
}

# --- annotation-prefix strip (scheme:value) -----------------------------------

test_that("a lowercase scheme:value annotation is still removed", {
  expect_equal(chain("theme:oceanography; real keyword"), "real keyword")
})

test_that("other prefixed classifications are still removed", {
  expect_equal(chain("ddc:530; physics"), "physics")
  expect_equal(chain("DOAJ:subject; physics"), "physics")
})

test_that("the FOS colon form is removed whole on both viz branches", {
  # The uppercase, spaced "FOS: name" scheme is not matched by the tightened
  # annotation strip and needs its own rule; without it the ": " normalisation
  # would leave a "FOS name" keyword.
  expect_equal(chain("FOS: Health sciences; real keyword"), "real keyword")
  expect_equal(chain("Machine Learning; FOS: Computer and information sciences"),
               "Machine Learning")
  expect_equal(chain("FOS: Physical sciences; keyword", vis_type = "timeline"),
               "keyword")
})

test_that("a MeSH colon-form keeps its descriptor", {
  # "Descriptor: qualifier" is capitalised and spaced, so the annotation strip
  # leaves it for the qualifier strip, which keeps the descriptor.
  expect_equal(chain("Lipopolysaccharides: administration & dosage"),
               "Lipopolysaccharides")
})

test_that("a 'Title: Subtitle' keyword is kept whole", {
  expect_equal(
    chain("Climate Change and Corporate Regulation: A Critical Analysis of Egypt’s Legal and Regulatory Regime"),
    "Climate Change and Corporate Regulation: A Critical Analysis of Egypt’s Legal and Regulatory Regime")
})

test_that("a mid-phrase ampersand is untouched", {
  expect_equal(chain("Science & technology; Business & economics"),
               "Science & technology; Business & economics")
})

# --- lettered classification codes in "CODE - Caption" form -------------------

test_that("a lettered dashed code is dropped whole, not fragmented", {
  expect_equal(chain("Meteorology; F331 - Atmospheric physics; solar eclipse"),
               "Meteorology; solar eclipse")
  expect_equal(chain("F800 - Physical geographical sciences; climate"),
               "climate")
})

test_that("existing classification removals still fire", {
  expect_equal(chain("32 Biomedical and clinical sciences; genetics"), "genetics")
  expect_equal(chain("5:621.313.323; electronics"), "electronics")
  expect_equal(chain("5-76.95; electronics"), "electronics")
  expect_equal(chain("HT165.5-169.9; urban studies"), "urban studies")
})

test_that("digit-bearing keywords keep their digits and their separators", {
  # three legacy rules used to break these forms: the residual-digit rule ate
  # "19; " (fusing the neighbours into "COVID- Male"), the LOC range rule
  # removed a standalone "COVID-19" whole, and the digit-classification rule
  # ate "19 Vaccines" out of "COVID-19 Vaccines".
  expect_equal(chain("COVID-19; Male; Cohort Studies"),
               "COVID-19; Male; Cohort Studies")
  expect_equal(chain("COVID-19 Vaccines; Aged"), "COVID-19 Vaccines; Aged")
  expect_equal(chain("COVID-19 [MeSH]; Cohort Studies [MeSH]; Humans [MeSH]"),
               "COVID-19; Cohort Studies; Humans")
})

test_that("a trailing major-topic marker is stripped in the full chain", {
  # some repositories deliver the MeSH marker at the end of the keyword
  expect_equal(chain("Genome-Wide Association Study*; Homeodomain Proteins; Pain / complications; Raynaud Disease* / genetics"),
               "Genome-Wide Association Study; Homeodomain Proteins; Pain; Raynaud Disease")
})

test_that("standalone numeric keywords are dropped, digits inside words kept", {
  expect_equal(chain("004; 624; Earth sciences"), "Earth sciences")
  expect_equal(chain("2020; climate change"), "climate change")
  expect_equal(chain("H5N1; influenza"), "H5N1; influenza")
})

test_that("code-like real keywords are kept", {
  expect_equal(chain("T2 MRI sequences; brain imaging"),
               "T2 MRI sequences; brain imaging")
  expect_equal(chain("3D printing; manufacturing"), "3D printing; manufacturing")
  # the LOC range rule requires a digits-only right side, so a hyphenated
  # marker pair is not mistaken for a classification range
  expect_equal(chain("CD4-CD8 ratio; immunology"), "CD4-CD8 ratio; immunology")
})

# --- comma handling -----------------------------------------------------------

test_that("a comma without a following space is an intra-tag join, not a separator", {
  expect_equal(chain("commercial geocoders; natural language; spaCy,Geography"),
               "commercial geocoders; natural language; spaCy,Geography")
})

test_that("a comma-space list is left as delivered", {
  expect_equal(chain("alpha, beta, gamma"), "alpha, beta, gamma")
})

test_that("MeSH comma-inversion still de-inverts", {
  expect_equal(chain("Systems, Decision Support [MeSH]; Humans [MeSH]"),
               "Decision Support Systems; Humans")
})

# --- separation / branch controls ---------------------------------------------

test_that("double-dash separation is still normalised", {
  expect_equal(chain("history -- culture"), "history; culture")
})

test_that("the timeline branch still strips markers and bracketed keywords", {
  expect_equal(chain("Climate [MeSH]; FOS Physics; keyword", vis_type = "timeline"),
               "Physics; keyword")
})

test_that("empty and NA subjects pass through", {
  expect_equal(chain(c("", NA), doaj = TRUE), c("", NA))
})

# --- DOAJ LCC caption/code block --------------------------------------------

test_that("caption+code pairs are dropped, real keywords kept", {
  expect_equal(chain("Environmental sciences; GE1-350; hydrograph; hydrology; machine learning",
                     doaj = TRUE),
               "hydrograph; hydrology; machine learning")
})

test_that("a full LCC block with one real keyword keeps only the keyword", {
  expect_equal(chain(paste("Earth sciences; Environmental sciences;",
                           "Environmental technology. Sanitary engineering; G; GE1-350;",
                           "Geography. Anthropology. Recreation; T; TD1-1066; Technology"),
                     doaj = TRUE),
               "Earth sciences")
})

test_that("a keyword-less hierarchy chain empties out cleanly", {
  expect_equal(chain("Science; Q; Physics; QC1-999; Geophysics. Cosmic physics; QC801-809",
                     doaj = TRUE),
               "")
  expect_equal(chain(paste("Technology; T; Environmental technology. Sanitary engineering;",
                           "TD1-1066; Geography. Anthropology. Recreation; G;",
                           "Environmental sciences; GE1-350"),
                     doaj = TRUE),
               "")
})

test_that("keywords next to a caption-absent code are never dropped", {
  # the code is removed by the generic rules; the real keywords survive, except
  # a keyword that IS the code's caption (the lowercased journal caption
  # deduplicated into the keyword list).
  expect_equal(chain("OCT; ophthalmology; retina; solar retinopathy; solar eclipse; RE1-994",
                     doaj = TRUE),
               "OCT; retina; solar retinopathy; solar eclipse")
})

test_that("caption lookalikes without a code are kept", {
  expect_equal(chain("Environmental sciences; hydrology", doaj = TRUE),
               "Environmental sciences; hydrology")
  expect_equal(chain("Technology; machine learning", doaj = TRUE),
               "Technology; machine learning")
})

test_that("non-DOAJ records skip the caption drop entirely", {
  expect_equal(chain("Environmental sciences; GE1-350; hydrology", doaj = FALSE),
               "Environmental sciences; hydrology")
})

test_that("comma-split caption fragments are dropped via the fragment vocabulary", {
  expect_equal(chain(paste("academic leadership; institutional effectiveness; campus culture;",
                           "decision making; academic institution; Economic growth; development;",
                           "planning; HD72-88; Regional economics. Space in economics; HT388"),
                     doaj = TRUE),
               "academic leadership; institutional effectiveness; campus culture; decision making; academic institution")
})

test_that("the doaj flag is applied per record", {
  out <- chain(c("Environmental sciences; GE1-350; hydrology",
                 "Environmental sciences; GE1-350; hydrology"),
               doaj = c(TRUE, FALSE))
  expect_equal(out, c("hydrology", "Environmental sciences; hydrology"))
})
