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
# A vocabulary with explicit counts: vocab_n(HIV = 806, hiv = 3).
vocab_n <- function(...) c(...)

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

# --- match_keyword_case: piecewise fallback for tokens with punctuation -------

test_that("a token the vocabulary does not hold whole is restored per alphanumeric run", {
  v <- vocab("HIV", "AIDS", "SDGs", "Alzheimer", "T2", "MRI", "CD4", "CD8")
  expect_equal(match_keyword_case("hiv/aids", v), "HIV/AIDS")
  expect_equal(match_keyword_case("(sdgs)", v), "(SDGs)")
  expect_equal(match_keyword_case("alzheimer's", v), "Alzheimer's")
  expect_equal(match_keyword_case("t2/mri", v), "T2/MRI")
  expect_equal(match_keyword_case("cd4/cd8", v), "CD4/CD8")
})

test_that("a whole-token match takes precedence over the piecewise fallback", {
  expect_equal(match_keyword_case("sars-cov-2", vocab("SARS-CoV-2", "SARS", "COV")),
               "SARS-CoV-2")
  expect_equal(match_keyword_case("e-learning", vocab("e-learning", "E", "Learning")),
               "e-learning")
})

test_that("runs without a match keep their spelling, and the guard applies per run", {
  expect_equal(match_keyword_case("hiv/hcv", vocab("HIV")), "HIV/hcv")
  expect_equal(match_keyword_case("rj456", vocab("RJ")), "rj456")
  expect_equal(match_keyword_case("hiv/aids", vocab_n(HIV = 5, AIDS = 1, aids = 1)),
               "HIV/aids")
  expect_equal(match_keyword_case("pa*erns", vocab("other")), "pa*erns")
})

test_that("the piecewise fallback covers the punctuation review vector", {
  # Spellings the corpus offers; AIDS is attested often enough to displace the
  # lowercase twin under the guarded pick (the review vector lists all three).
  v <- vocab_n(HIV = 3, aiDs = 1, aids = 1, AIDS = 3, Prevention = 1, LSTM = 1,
               MC = 1, Conserving = 1, RJ = 1, RJ45 = 1, J = 1, PET = 1)
  starting <- c("hiv", "hiv/aids", "aids", "normal keyword", "hivemind", "maidsen",
                "hiv infections", "hiv prevention", "lstm-based rainfall-runoff",
                "mc-lstm mass-conserving", "rj45", "rj.45", "rj456", "j-pet detector")
  expected <- c("HIV", "HIV/AIDS", "AIDS", "Normal keyword", "Hivemind", "Maidsen",
                "HIV infections", "HIV Prevention", "LSTM-based rainfall-runoff",
                "MC-LSTM mass-Conserving", "RJ45", "RJ.45", "Rj456", "J-PET detector")
  expect_equal(vapply(starting, fix_keyword_casing, "", type_counts = v,
                      USE.NAMES = FALSE), expected)
})

test_that("casing_decisions records a piecewise token per run", {
  d <- casing_decisions(list("hiv/aids ratio"), vocab("HIV", "AIDS", "ratio"))
  expect_equal(d$token, c("hiv", "aids", "ratio"))
  expect_equal(d$chosen, c("HIV", "AIDS", "ratio"))
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

# --- lower_allcaps_spans: ALL-CAPS titles and keywords do not attest capitalised spellings --
#
# The casing vocabulary is built from the unlowered corpus, where each document
# starts with the paper's title. A title written entirely in capitals is
# lowered there first, so a single shouting title cannot set the casing of its
# words for the whole map. Only the casing vocabulary sees this; the clustering
# and tf-idf corpora are lowercased anyway.

if (!exists("getLogger")) suppressMessages(library(logging))
if (!exists("lower_allcaps_spans")) source("features.R")

allcaps_fixture <- function() {
  metadata <- data.frame(
    id = c("p1", "p2", "p3"),
    title = c("DIMENSIONALITY REDUCTION FOR FEW-SHOT LEARNING",
              "Dimensionality reduction in practice",
              "COVID-19 outcomes in adults"),
    paper_abstract = c("We study gradient space methods.",
                       "Gradient methods are common.",
                       "COVID-19 is compared with COVID-19 variants."),
    subject_orig = c("REDES COMPLEXAS; HIV; EORTC 1709",
                     "Prosocial behavior; machine learning",
                     "SNOMED CT"),
    stringsAsFactors = FALSE)
  text <- data.frame(id = metadata$id,
                     content = paste(metadata$title, metadata$paper_abstract, metadata$subject_orig),
                     stringsAsFactors = FALSE)
  list(metadata = metadata, corpus = create_corpus(metadata, text, c("the")))
}

test_that("is_allcaps flags capital-only titles and nothing else", {
  expect_equal(is_allcaps(c("DIMENSIONALITY REDUCTION", "COVID-19 IN 2020", "Covid-19 outcomes",
                            "COVID-19 outcomes", "2020", "", NA)),
               c(TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE))
})

test_that("an ALL-CAPS title no longer attests capitalised variants", {
  fx <- allcaps_fixture()
  before <- get_type_counts(fx$corpus$unlowered)
  after  <- get_type_counts(lower_allcaps_spans(fx$corpus$unlowered, fx$metadata))
  expect_equal(unname(before["DIMENSIONALITY"]), 1)
  expect_true(is.na(after["DIMENSIONALITY"]))
  expect_equal(unname(after["dimensionality"]), 1)
  expect_true(is.na(after["FEW-SHOT"]))
  expect_equal(unname(after["few-shot"]), 1)
})

test_that("mixed-case titles and abstracts are left as they are", {
  fx <- allcaps_fixture()
  after <- get_type_counts(lower_allcaps_spans(fx$corpus$unlowered, fx$metadata))
  # p2's Titlecase title word and p3's acronym are untouched...
  expect_equal(unname(after["Dimensionality"]), 1)
  expect_equal(unname(after["COVID-19"]), 3)
  # ...and so is the abstract of the ALL-CAPS paper.
  expect_equal(unname(after["gradient"]), 1)
  expect_equal(unname(after["Gradient"]), 1)
})

test_that("the lowered title feeds the pick: the shouting title no longer wins", {
  fx <- allcaps_fixture()
  tc <- get_type_counts(lower_allcaps_spans(fx$corpus$unlowered, fx$metadata))
  expect_equal(match_keyword_case("dimensionality", tc), "dimensionality")
})

test_that("the input corpus and the metadata are not modified", {
  fx <- allcaps_fixture()
  invisible(lower_allcaps_spans(fx$corpus$unlowered, fx$metadata))
  expect_true(startsWith(content(fx$corpus$unlowered[[1]]), "DIMENSIONALITY"))
  expect_equal(fx$metadata$title[1], "DIMENSIONALITY REDUCTION FOR FEW-SHOT LEARNING")
})

test_that("a map without ALL-CAPS titles or keywords is returned unchanged", {
  fx <- allcaps_fixture()
  md <- fx$metadata
  md$title[1] <- "Dimensionality reduction for few-shot learning"
  md$subject_orig <- c("Redes complexas; HIV; EORTC 1709", "Prosocial behavior; machine learning", "Snomed CT")
  expect_identical(get_type_counts(lower_allcaps_spans(fx$corpus$unlowered, md)),
                   get_type_counts(fx$corpus$unlowered))
})

test_that("is_allcaps_phrase needs capitals and at least two alphabetic words", {
  expect_equal(is_allcaps_phrase(c("REDES COMPLEXAS", "SNOMED CT", "HIV", "EORTC 1709",
                                   "Machine LEARNING", "COVID-19", "", NA)),
               c(TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE))
})

test_that("a multi-word ALL-CAPS keyword no longer attests capitalised variants", {
  fx <- allcaps_fixture()
  before <- get_type_counts(fx$corpus$unlowered)
  after  <- get_type_counts(lower_allcaps_spans(fx$corpus$unlowered, fx$metadata))
  expect_equal(unname(before["REDES"]), 1)
  expect_true(is.na(after["REDES"]))
  expect_equal(unname(after["redes"]), 1)
  expect_equal(unname(after["complexas"]), 1)
  # a phrase of two acronyms is still a phrase and is lowered too
  expect_true(is.na(after["SNOMED"]))
  expect_equal(unname(after["snomed"]), 1)
})

test_that("single-word acronym keywords and acronym-plus-number keywords are kept", {
  fx <- allcaps_fixture()
  after <- get_type_counts(lower_allcaps_spans(fx$corpus$unlowered, fx$metadata))
  expect_equal(unname(after["HIV"]), 1)
  expect_equal(unname(after["EORTC"]), 1)
  expect_true(is.na(after["eortc"]))
})

test_that("mixed-case keywords are left as they are", {
  fx <- allcaps_fixture()
  after <- get_type_counts(lower_allcaps_spans(fx$corpus$unlowered, fx$metadata))
  expect_equal(unname(after["Prosocial"]), 1)
  expect_equal(unname(after["machine"]), 1)
})

test_that("keywords come from subject when subject_orig is absent", {
  fx <- allcaps_fixture()
  md <- fx$metadata; md$subject <- md$subject_orig; md$subject_orig <- NULL
  after <- get_type_counts(lower_allcaps_spans(fx$corpus$unlowered, md))
  expect_true(is.na(after["REDES"]))
  expect_equal(unname(after["redes"]), 1)
})
