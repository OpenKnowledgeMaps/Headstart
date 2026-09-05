# TDD spec suite for the consolidated n-gram generator task
#
# Part A — generator invariants and the drop-in equivalence.
#   These pin CURRENT behaviour and must stay green throughout the task.
# Part B — spec deltas, written test-first: RED until the implementation lands.
#   B1: `ngram_lengths` accepts 1 directly (include_unigrams becomes an alias).
#   B2: env-var config resolvers (ngram_setting / include_abstracts, ranking.R,
#       mirroring ranking_mode) and the setting→lengths mapping.
#
# Runs inside the pipeline image (summarize.R needs tm/stringr) — via
# test/run_tests.sh.

if (!exists("replay_labels")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

STOPS <- c("and", "in", "the", "of", "to", "on", "for", "a", "with", "from",
           "der", "im", "von", "und")

# Mixed real-world titles: clean, punctuation-segmented, compound-bearing,
# non-Latin letters. Drives the property checks and the drop-in equivalence.
GOLD_TITLES <- c(
  "Calls of Care: Materializing Posthuman Personhood with Conversational Agents in Dementia Care",
  "Tough Decisions? Supporting System Classification According to the AI Act",
  "Der AMS-Algorithmus und Diskriminierung im digitalen staatlichen Handeln",
  "Wnt/β-catenin signaling regulates tumor growth",
  "Rainfall-runoff trends in the south-eastern USA: 1938-2005",
  "Unpacking Forms of Relatedness around Older People and Telecare",
  "solar photovoltaic panel efficiency degradation analysis",
  "Biomedical big data opportunities and challenges for research"
)

token_count <- function(g) length(strsplit(g, "_", fixed = TRUE)[[1]])
edge_tokens <- function(g) {
  toks <- strsplit(g, "_", fixed = TRUE)[[1]]
  c(toks[1], toks[length(toks)])
}

# --- Part A: generator invariants (green — guard current behaviour) ----------

test_that("length-membership: every n-gram's token count is a requested length", {
  for (L in list(c(2, 3), c(2, 3, 4), c(2, 3, 4, 5))) {
    for (t in GOLD_TITLES) {
      out <- ngram_candidates(t, STOPS, ngram_lengths = L)
      if (length(out)) expect_true(all(vapply(out, token_count, integer(1)) %in% L))
    }
  }
})

test_that("4- and 5-grams are actually formed on a long clean title", {
  out <- ngram_candidates("solar photovoltaic panel efficiency degradation analysis",
                          STOPS, ngram_lengths = c(4, 5))
  counts <- vapply(out, token_count, integer(1))
  expect_true(4 %in% counts)
  expect_true(5 %in% counts)
  expect_true("solar_photovoltaic_panel_efficiency_degradation" %in% out)
})

test_that("filter-correctness: no stopword edges, first != last", {
  for (t in GOLD_TITLES) {
    out <- ngram_candidates(t, STOPS, ngram_lengths = c(2, 3, 4, 5))
    for (g in out) {
      e <- edge_tokens(g)
      expect_false(tolower(e[1]) %in% STOPS)
      expect_false(tolower(e[2]) %in% STOPS)
      expect_false(e[1] == e[2])
    }
  }
})

test_that("unigram rules: no stopword or purely numeric token survives", {
  out <- ngram_candidates("study 4.0 from 2013-2023 with 350,067 records overview",
                          STOPS, ngram_lengths = 2, include_unigrams = TRUE)
  unis <- out[vapply(out, token_count, integer(1)) == 1]
  expect_true("study" %in% unis)
  expect_true("overview" %in% unis)
  expect_false(any(c("4.0", "2013-2023", "350,067", "with", "from") %in% unis))
})

test_that("additivity: a combined lengths call equals the union of single-length calls", {
  for (t in GOLD_TITLES) {
    combined <- ngram_candidates(t, STOPS, ngram_lengths = c(2, 3, 4))
    parts <- unlist(lapply(c(2, 3, 4), function(n)
      ngram_candidates(t, STOPS, ngram_lengths = n)))
    expect_true(setequal(combined, parts))
  }
})

test_that("determinism: repeated calls are identical, order included", {
  for (t in GOLD_TITLES) {
    a <- ngram_candidates(t, STOPS, ngram_lengths = c(2, 3, 4),
                          include_unigrams = TRUE)
    b <- ngram_candidates(t, STOPS, ngram_lengths = c(2, 3, 4),
                          include_unigrams = TRUE)
    expect_identical(a, b)
  }
})

test_that("short inputs: only the achievable lengths are returned", {
  out <- ngram_candidates("emergent leadership", STOPS, ngram_lengths = c(2, 3, 4, 5))
  expect_equal(out, "emergent_leadership")
  expect_equal(ngram_candidates("leadership", STOPS, ngram_lengths = c(2, 3)),
               character(0))
})

test_that("drop-in: unique(ngram_candidates(c(2,3))) reproduces paper_title_ngrams", {
  for (t in GOLD_TITLES) {
    expect_equal(unique(ngram_candidates(t, STOPS, ngram_lengths = c(2, 3))),
                 paper_title_ngrams(t, STOPS))
  }
})

# --- Part B: spec deltas (until implemented — TDD targets) ------------------

test_that("lengths accept 1 directly: c(1,2,3) yields unigrams", {
  out <- ngram_candidates("biomedical data opportunities", STOPS,
                          ngram_lengths = c(1, 2, 3))
  expect_true(all(c("biomedical", "data", "opportunities") %in% out))
})

test_that("alias: c(1, n...) is identical to include_unigrams = TRUE", {
  for (t in GOLD_TITLES) {
    expect_identical(ngram_candidates(t, STOPS, ngram_lengths = c(1, 2, 3)),
                     ngram_candidates(t, STOPS, ngram_lengths = c(2, 3),
                                      include_unigrams = TRUE))
  }
})

test_that("unigram-only call works and applies the unigram rules", {
  out <- ngram_candidates("published in 2020 review", STOPS, ngram_lengths = 1)
  expect_true(setequal(out, c("published", "review")))
})

# Env-var config resolvers: live alongside ranking_mode() in ranking.R.
clear_ngram_env <- function() {
  vars <- names(Sys.getenv())
  vars <- vars[startsWith(vars, "NGRAM_SETTING") | startsWith(vars, "INCLUDE_ABSTRACTS")]
  if (length(vars)) Sys.unsetenv(vars)
}

test_that("ngram_setting: unset env defaults to setting 0", {
  expect_true(exists("ngram_setting"))
  clear_ngram_env()
  expect_equal(ngram_setting(), "0")
  expect_equal(ngram_setting("orcid"), "0")
})

test_that("ngram_setting: global NGRAM_SETTING is honoured, invalid falls through", {
  clear_ngram_env()
  Sys.setenv(NGRAM_SETTING = "3")
  expect_equal(ngram_setting(), "3")
  expect_equal(ngram_setting("base"), "3")
  Sys.setenv(NGRAM_SETTING = "9")
  expect_equal(ngram_setting(), "0")
  clear_ngram_env()
})

test_that("ngram_setting: per-integration override beats global; invalid override falls to global", {
  clear_ngram_env()
  Sys.setenv(NGRAM_SETTING = "1", NGRAM_SETTING_ORCID = "5")
  expect_equal(ngram_setting("orcid"), "5")
  expect_equal(ngram_setting("base"), "1")
  Sys.setenv(NGRAM_SETTING_ORCID = "banana")
  expect_equal(ngram_setting("orcid"), "1")
  clear_ngram_env()
})

test_that("include_abstracts: default FALSE, env-enabled, per-integration override", {
  expect_true(exists("include_abstracts"))
  clear_ngram_env()
  expect_false(include_abstracts())
  Sys.setenv(INCLUDE_ABSTRACTS = "true")
  expect_true(include_abstracts("orcid"))
  Sys.setenv(INCLUDE_ABSTRACTS_ORCID = "false")
  expect_false(include_abstracts("orcid"))
  expect_true(include_abstracts("base"))
  clear_ngram_env()
})

test_that("setting -> lengths mapping (C3, §7.3)", {
  expect_true(exists("ngram_setting_lengths"))
  # Setting 0: generator-routed baseline replication — title sites form bi+tri;
  # the corpus-level "1,2,2,3" is emergent (G1 subject route stays active)
  expect_equal(ngram_setting_lengths("0"), c(2, 3))
  expect_equal(ngram_setting_lengths("1"), c(1, 2, 3))
  expect_equal(ngram_setting_lengths("2"), c(1, 2, 3, 4))
  expect_equal(ngram_setting_lengths("3"), c(2, 3, 4))
  expect_equal(ngram_setting_lengths("4"), c(1, 2, 3, 4, 5))
  expect_equal(ngram_setting_lengths("5"), c(2, 3, 4, 5))
})

# --- Systematic sweep: the invariants over EVERY setting's length vector -----

test_that("sweep: length-membership holds for every setting's lengths", {
  for (s in as.character(1:5)) {
    L <- ngram_setting_lengths(s)
    for (t in GOLD_TITLES) {
      out <- ngram_candidates(t, STOPS, ngram_lengths = L)
      if (length(out))
        expect_true(all(vapply(out, token_count, integer(1)) %in% L))
    }
  }
})

test_that("sweep: filter-correctness holds for every setting's lengths", {
  for (s in as.character(1:5)) {
    L <- ngram_setting_lengths(s)
    for (t in GOLD_TITLES) {
      out <- ngram_candidates(t, STOPS, ngram_lengths = L)
      for (g in out) {
        toks <- strsplit(g, "_", fixed = TRUE)[[1]]
        expect_false(tolower(toks[1]) %in% STOPS)
        expect_false(tolower(toks[length(toks)]) %in% STOPS)
        if (length(toks) >= 2) expect_false(toks[1] == toks[length(toks)])
        if (length(toks) == 1)                       # unigram rules
          expect_false(grepl("^[0-9]+([.,:-][0-9]+)*$", g))
      }
    }
  }
})

test_that("sweep: determinism and order-stability hold for every setting's lengths", {
  for (s in as.character(1:5)) {
    L <- ngram_setting_lengths(s)
    for (t in GOLD_TITLES)
      expect_identical(ngram_candidates(t, STOPS, ngram_lengths = L),
                       ngram_candidates(t, STOPS, ngram_lengths = L))
  }
})

# --- Part C: integration (the settings pipeline, replay-based) ---------------

test_that("bypass helper blanks only flagged subjects", {
  md <- data.frame(subject = c("real keywords", "synthesised stuff"),
                   subject_is_heuristic = c(FALSE, TRUE), stringsAsFactors = FALSE)
  expect_equal(bypass_heuristic_subjects(md)$subject, c("real keywords", ""))
  md2 <- data.frame(subject = "keep", stringsAsFactors = FALSE)  # no flag column
  expect_equal(bypass_heuristic_subjects(md2)$subject, "keep")
})

test_that("Setting 1 heuristic columns contain unigrams (6.6b S1)", {
  md <- data.frame(title = c("solar photovoltaic efficiency", "solar energy analysis"),
                   stringsAsFactors = FALSE)
  out <- add_heuristic_keyword_fields(md, STOPS, ngram_lengths = c(1, 2, 3))
  expect_true("solar" %in% strsplit(out[[HEUR_MIN1]][1], "; ", fixed = TRUE)[[1]])
  expect_true("solar" %in% strsplit(out[[HEUR_MIN2]][1], "; ", fixed = TRUE)[[1]])  # DF 2
})

test_that("abstract flag feeds title+abstract for flagged papers only", {
  md <- data.frame(title = c("short title", "flagged title"),
                   paper_abstract = c("alpha ignored", "quantum entanglement experiments"),
                   subject_is_heuristic = c(FALSE, TRUE), stringsAsFactors = FALSE)
  out <- add_heuristic_keyword_fields(md, STOPS, ngram_lengths = c(1, 2, 3),
                                      include_abstracts = TRUE)
  expect_false("alpha" %in% strsplit(out[[HEUR_MIN1]][1], "; ", fixed = TRUE)[[1]])
  expect_true("quantum" %in% strsplit(out[[HEUR_MIN1]][2], "; ", fixed = TRUE)[[1]])
  off <- add_heuristic_keyword_fields(md, STOPS, ngram_lengths = c(1, 2, 3))
  expect_false("quantum" %in% strsplit(off[[HEUR_MIN1]][2], "; ", fixed = TRUE)[[1]])
})

ITU_FX <- "test/replay/itu_0204881x.inputs.rds"

test_that("sweep: EVERY setting is coerced to the mode-0 baseline under ranking mode 0", {
  if (!file.exists(ITU_FX)) { cat("  (itu fixture missing - skipped)\n"); expect_true(TRUE) } else {
    on.exit(clear_ngram_env(), add = TRUE)
    base <- read_expected("itu_0204881x", "0")
    for (s in as.character(1:5)) {
      clear_ngram_env()
      Sys.setenv(NGRAM_SETTING = s)
      expect_equal(replay_labels(ITU_FX, mode = "0"), base)
    }
  }
})

test_that("Setting 1 runs end-to-end: every cluster labelled; a bounded behaviour change", {
  if (!file.exists(ITU_FX)) { cat("  (itu fixture missing - skipped)\n"); expect_true(TRUE) } else {
    clear_ngram_env()
    Sys.setenv(NGRAM_SETTING = "1")
    on.exit(clear_ngram_env(), add = TRUE)
    labels <- replay_labels(ITU_FX, mode = "1")
    base <- read_expected("itu_0204881x", "1")
    expect_equal(length(labels), length(base))
    expect_true(all(nzchar(as.character(labels))))
    # S1 (bypass + deduped 1,2,3) is a deliberate behaviour change vs baseline
    expect_false(identical(as.character(labels), as.character(base)))
  }
})
