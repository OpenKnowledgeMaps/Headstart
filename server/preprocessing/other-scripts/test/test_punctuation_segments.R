# Unit tests for the punctuation-aware segmentation helper
# (punctuation_segments, summarize.R) and its use in the n-gram builders
# (ngram_candidates, paper_title_ngrams). The helper splits at punctuation
# with adjoining whitespace (string edges and punctuation runs included) and
# keeps tight marks inside their tokens; colon, em dash, pipe and underscore
# always split; colon keep-list tokens and multi-period abbreviation chains
# stay whole.
#
# Runs inside the pipeline image (summarize.R needs stringr/logging) — via
# test/run_tests.sh.

if (!exists("replay_labels")) source("test/replay_harness.R")
if (!requireNamespace("testthat", quietly = TRUE)) {
  if (!exists("test_that")) source("test/testthat_shim.R")
} else {
  library(testthat)
}

STOPS <- c("and", "in", "the", "of", "to", "on", "for", "a", "or", "than",
           "just", "more", "an", "from", "vs")

seg <- punctuation_segments

# --- token-identity normalization -----------------------------------------

test_that("hyphen variants normalize to ASCII hyphen and stay tight", {
  expect_equal(seg("Event‐Driven Architecture"), "Event-Driven Architecture")
  expect_equal(seg("Event‑Driven Architecture"), "Event-Driven Architecture")
  expect_equal(seg("human–primate interactions"), "human-primate interactions")
})

test_that("curly apostrophes normalize to ASCII apostrophe", {
  expect_equal(seg("the author’s view"), "the author's view")
})

test_that("tight double hyphen folds to one hyphen; spaced double hyphen splits", {
  expect_equal(seg("Rainfall--Runoff modeling"), "Rainfall-Runoff modeling")
  expect_equal(seg("FiLLM -- A framework"), c("FiLLM", "A framework"))
})

test_that("em dash is not folded to hyphen — it splits", {
  expect_equal(seg("Game Theory—More Than Just Games"),
               c("Game Theory", "More Than Just Games"))
})

# --- Unicode letters are never punctuation --------------------------------

test_that("accented and non-Latin letters survive intact", {
  expect_equal(seg("Modelos energéticos"), "Modelos energéticos")
  expect_equal(seg("análise geográfica"), "análise geográfica")
  expect_equal(seg("Ҡ-mesons decay"), "Ҡ-mesons decay")
})

# --- spacing classification -----------------------------------------------

test_that("tight compounds keep themselves", {
  expect_equal(seg("Developing location-based services"),
               "Developing location-based services")
  expect_equal(seg("children's understanding"), "children's understanding")
  expect_equal(seg("physician assistant/associate education"),
               "physician assistant/associate education")
  expect_equal(seg("Virtual R&D Teams"), "Virtual R&D Teams")
  expect_equal(seg("TRIPOD+AI statement"), "TRIPOD+AI statement")
  expect_equal(seg("Education 4.0 Readiness"), "Education 4.0 Readiness")
  expect_equal(seg("study of 350,067 individuals"), "study of 350,067 individuals")
})

test_that("spaced marks split", {
  expect_equal(seg("Towards 4D Cartography - Four-dimensional views"),
               c("Towards 4D Cartography", "Four-dimensional views"))
  expect_equal(seg("Climate Policy / Special issue"),
               c("Climate Policy", "Special issue"))
  expect_equal(seg("Crowdsourcing, citizen sensing"),
               c("Crowdsourcing", "citizen sensing"))
})

test_that("string edges count as whitespace", {
  expect_equal(seg("'Quoted title'"), "Quoted title")
  expect_equal(seg("current methods."), "current methods")
  expect_equal(seg("[tag] Some Title"), c("tag", "Some Title"))
})

test_that("punctuation runs split as a unit, whatever their spacing", {
  expect_equal(seg("surgery publications]."), "surgery publications")
  expect_equal(seg("professors?:Professorial leadership"),
               c("professors", "Professorial leadership"))
  # accepted miss: a compound hyphen inside a run collapses to a boundary
  expect_equal(seg("Digital (LLM)-Powered assistant"),
               c("Digital", "LLM", "Powered assistant"))
})

test_that("tight single wordplay parens keep (odd tokens accepted)", {
  expect_equal(seg("Organisational (in)justice"), c("Organisational", "in)justice"))
  expect_equal(seg("micro(nano) plastic pollution"),
               c("micro(nano", "plastic pollution"))
})

# --- per-character deviations ---------------------------------------------

test_that("fullwidth colon normalizes and splits like an ASCII colon", {
  expect_equal(seg("oxidation processes：a review"),
               c("oxidation processes", "a review"))
})

test_that("colon always splits, tight or spaced", {
  expect_equal(seg("academic leaders:professorial leadership"),
               c("academic leaders", "professorial leadership"))
  expect_equal(seg("Wind Energy in Germany: Potential Areas"),
               c("Wind Energy in Germany", "Potential Areas"))
  expect_equal(seg("ratio 70:30 something"), c("ratio 70", "30 something"))
})

test_that("colon keep-list tokens stay whole", {
  expect_equal(seg("a 80:20 split"), "a 80:20 split")
  expect_equal(seg("mixed 50:50."), "mixed 50:50")
})

test_that("colon splits around an intact tight-symbol name", {
  expect_equal(seg("PROBAST+AI:an updated guideline"),
               c("PROBAST+AI", "an updated guideline"))
})

test_that("multi-period abbreviation chains keep their trailing period", {
  expect_equal(seg("U.S. policy"), "U.S. policy")
  expect_equal(seg("see e.g. something"), "see e.g. something")
  expect_equal(seg("regulation in the U.S., and the U.K. from 2020"),
               c("regulation in the U.S.", "and the U.K. from 2020"))
  expect_equal(seg("the U.S.E. framework"), "the U.S.E. framework")
})

test_that("period plus whitespace splits after a full word", {
  expect_equal(seg("Man vs. Machine"), c("Man vs", "Machine"))
})

test_that("tight periods keep dotted identifiers", {
  expect_equal(seg("B.1.351 variant"), "B.1.351 variant")
  expect_equal(seg("core.ac.uk repository"), "core.ac.uk repository")
  expect_equal(seg("Fisheries Sector.docx"), "Fisheries Sector.docx")
})

test_that("em dash splits even tight; en dash does not trip the exception", {
  expect_equal(seg("Urban Emotions—Geo-Semantic Emotion Extraction"),
               c("Urban Emotions", "Geo-Semantic Emotion Extraction"))
  expect_equal(seg("rainfall–runoff modeling"), "rainfall-runoff modeling")
})

test_that("pipe and underscore always split", {
  out <- seg("Twitter. GI_Forum|GI_Forum 2018, Volume 1 |")
  expect_false(any(grepl("[|_]", out)))
  expect_true("Twitter" %in% out)
})

# --- invariants ----------------------------------------------------------

test_that("I2 no-span: every n-gram lies within one segment", {
  titles <- c(
    "The beauty or the beast? Attacking rate limits of the xen hypervisor",
    "Wind Energy in Germany: Potential Areas",
    "Urban Emotions—Geo-Semantic Emotion Extraction",
    "Strength in numbers:How citizen science helps",
    "Tough Decisions? Supporting System Classification According to the AI Act"
  )
  for (t in titles) {
    segments <- seg(t)
    for (g in ngram_candidates(t, STOPS)) {
      phrase <- gsub("_", " ", g, fixed = TRUE)
      expect_true(any(grepl(phrase, segments, fixed = TRUE)))
    }
  }
})

test_that("motivating span failures are gone", {
  out <- ngram_candidates(
    "The beauty or the beast? Attacking rate limits of the xen hypervisor", STOPS)
  expect_false(any(grepl("beast_", out, fixed = TRUE)))
  out <- ngram_candidates("Wind Energy in Germany: Potential Areas", STOPS)
  expect_false(any(grepl("Germany_Potential", out, fixed = TRUE)))
  expect_true("Wind_Energy" %in% out)
  expect_true("Potential_Areas" %in% out)
  out <- ngram_candidates(
    "Tough Decisions? Supporting System Classification According to the AI Act", STOPS)
  expect_false(any(grepl("Decisions_Supporting", out, fixed = TRUE)))
  expect_true("Tough_Decisions" %in% out)
  expect_true("Supporting_System" %in% out)
})

test_that("I1 boundary equivalence: any boundary char at the same position yields the same keywords", {
  stem <- "Calls of Care%s Materializing Posthuman Personhood with Conversational Agents in Dementia Care"
  variants <- lapply(c(":", "?", ",", ";", " -", "."),
                     function(p) ngram_candidates(sprintf(stem, p), STOPS))
  for (v in variants[-1]) expect_identical(v, variants[[1]])
  segments <- seg(sprintf(stem, ":"))
  expect_equal(segments[1], "Calls of Care")
})

test_that("I1 scoping: tight positions are not equivalent across chars", {
  # at a tight position a comma keeps (fused token) while a colon still
  # splits (always-split deviation) — intentionally different
  expect_equal(seg("word,word here"), "word,word here")
  expect_equal(seg("word:word here"), c("word", "word here"))
})

test_that("I3 boundary insertion removes exactly the spanning n-grams", {
  base <- ngram_candidates("alpha beta gamma delta", STOPS)
  split <- ngram_candidates("alpha beta: gamma delta", STOPS)
  expect_true(all(split %in% base))
  expect_identical(sort(setdiff(base, split)),
                   sort(c("beta_gamma", "alpha_beta_gamma", "beta_gamma_delta")))
  expect_identical(sort(split), sort(c("alpha_beta", "gamma_delta")))
})

test_that("I3 on a real title: only the n-grams spanning the inserted boundary go", {
  base <- ngram_candidates(
    "Unpacking Forms of Relatedness around Older People and Telecare", STOPS)
  split <- ngram_candidates(
    "Unpacking: Forms of Relatedness around Older People and Telecare", STOPS)
  # the only surviving candidate that crossed the insertion point is the
  # bigram (the spanning trigram ends in a stopword and never formed)
  expect_identical(setdiff(base, split), "Unpacking_Forms")
  expect_identical(split, setdiff(base, "Unpacking_Forms"))
  expect_true("Forms_of_Relatedness" %in% split)
})

test_that("I4 compound atomicity: Unicode variant forms yield identical output", {
  expect_identical(ngram_candidates("Event‐Driven services", STOPS),
                   ngram_candidates("Event-Driven services", STOPS))
  expect_identical(ngram_candidates("the author’s view of things", STOPS),
                   ngram_candidates("the author's view of things", STOPS))
})

# every n-gram token that carries part of the compound must carry all of it
expect_atomic <- function(out, compound, parts) {
  toks <- unlist(strsplit(out, "_", fixed = TRUE))
  for (p in parts) expect_false(p %in% toks)
  expect_true(compound %in% toks)
}

test_that("I4 compounds stay one token inside every n-gram", {
  DE <- c(STOPS, "der", "und", "im", "von")
  out <- ngram_candidates("Der AMS-Algorithmus bewertet Arbeitsmarktchancen automatisch", DE)
  expect_atomic(out, "AMS-Algorithmus", c("AMS", "Algorithmus"))
  expect_true("AMS-Algorithmus_bewertet" %in% out)
  out <- ngram_candidates("children's rights across Europe today", STOPS)
  expect_atomic(out, "children's", c("children", "s"))
  expect_true("children's_rights" %in% out)
})

test_that("I4 a compound next to a punctuation run stays atomic", {
  DE <- c(STOPS, "der", "und", "im", "von")
  t <- paste("Der AMS-Algorithmus. ; Transparenz, Verantwortung und Diskriminierung",
             "im Kontext von digitalem staatlichem Handeln")
  # the ". ;" run and the comma are boundaries; the compound is not touched
  expect_equal(punctuation_segments(t)[1:2], c("Der AMS-Algorithmus", "Transparenz"))
  # the compound survives the segmentation as a whole unigram candidate
  # (its only bigram, "Der_AMS-Algorithmus", starts with a stopword and prunes)
  uni <- ngram_candidates(t, DE, include_unigrams = TRUE)
  expect_atomic(uni, "AMS-Algorithmus", c("AMS", "Algorithmus"))
  # U+2010 spelling of the same title is indistinguishable
  expect_identical(ngram_candidates(sub("AMS-", "AMS‐", t, fixed = TRUE), DE,
                                    include_unigrams = TRUE), uni)
})

test_that("I5 letter preservation: accenting a word only respells its token", {
  plain <- ngram_candidates("Modelos energeticos para la transicion", STOPS)
  accented <- ngram_candidates("Modelos energéticos para la transición", STOPS)
  respelled <- gsub("transicion", "transición",
                    gsub("energeticos", "energéticos", plain))
  expect_identical(accented, respelled)
  expect_equal(length(accented), length(plain))
})

test_that("I5 non-Latin letters neither drop the token nor split its n-grams", {
  latin <- ngram_candidates("K-mesons decay rates measured", STOPS)
  cyrillic <- ngram_candidates("Ҡ-mesons decay rates measured", STOPS)
  expect_identical(cyrillic, gsub("K-mesons", "Ҡ-mesons", latin, fixed = TRUE))
  expect_true("Ҡ-mesons_decay" %in% cyrillic)
  expect_true("energético" %in%
                ngram_candidates("un modelo energético nuevo", STOPS,
                                 include_unigrams = TRUE))
})

test_that("I6 determinism: the same input always gives the same output", {
  t <- "Towards 4D Cartography - Four-dimensional views"
  expect_identical(ngram_candidates(t, STOPS), ngram_candidates(t, STOPS))
  expect_identical(seg(t), seg(t))
  expect_identical(paper_title_ngrams(t, STOPS), paper_title_ngrams(t, STOPS))
})

test_that("I6 whitespace around a boundary does not change the outcome", {
  expect_identical(seg("A word - another word"), seg("A word  -  another word"))
  spacings <- c("Care: Materializing agents", "Care : Materializing agents",
                "Care :Materializing agents", "Care:Materializing agents")
  outs <- lapply(spacings, ngram_candidates, stops = STOPS)
  for (o in outs[-1]) expect_identical(o, outs[[1]])
})

test_that("I6 run length does not change the outcome", {
  runs <- c("the beast? Attacking rate limits", "the beast?! Attacking rate limits",
            "the beast?!... Attacking rate limits", "the beast]. Attacking rate limits")
  outs <- lapply(runs, ngram_candidates, stops = STOPS)
  for (o in outs[-1]) expect_identical(o, outs[[1]])
})

test_that("I6 idempotence: segmenting a segment returns it unchanged", {
  for (t in c("Wind Energy in Germany: Potential Areas",
              "Der AMS-Algorithmus. ; Transparenz, Verantwortung",
              "U.S. policy and 4.0 readiness")) {
    segments <- seg(t)
    expect_identical(unlist(lapply(segments, seg)), segments)
  }
})

test_that("accepted misses behave as documented", {
  # tight comma and tight run-on period fuse (singleton formatting errors)
  expect_equal(seg("Necessary,feasible steps"), "Necessary,feasible steps")
  expect_equal(seg("school administrators.Under Kalasin"),
               "school administrators.Under Kalasin")
})

# --- site routing ---------------------------------------------------------

test_that("ngram_candidates segments its input (synthesizer/fallback path)", {
  out <- ngram_candidates("Publisher Correction: Reporting guideline", STOPS)
  expect_true("Reporting_guideline" %in% out)
  expect_false("Correction_Reporting" %in% out)
})

test_that("unigram numeric prune covers separator-bearing numbers", {
  out <- ngram_candidates("Education 4.0 Readiness study", STOPS,
                          include_unigrams = TRUE)
  expect_false("4.0" %in% out)
  expect_true("Education" %in% out)
  out <- ngram_candidates("Trends (2013–2023) analysis", STOPS,
                          include_unigrams = TRUE)
  expect_false("2013-2023" %in% out)
  out <- ngram_candidates("cohort of 350,067 individuals", STOPS,
                          include_unigrams = TRUE)
  expect_false("350,067" %in% out)
  expect_true("covid-19" %in% ngram_candidates("covid-19 spread", STOPS,
                                               include_unigrams = TRUE))
})

test_that("paper_title_ngrams segments its input (label-candidate path)", {
  out <- paper_title_ngrams("Urban Emotions—Geo-Semantic Emotion Extraction", STOPS)
  expect_true("Emotion_Extraction" %in% out)
  expect_false(any(grepl("Emotions_Geo", out, fixed = TRUE)))
})

test_that("gold set: hand-written expected keyword sets", {
  expect_identical(sort(ngram_candidates("Developing location-based services", STOPS)),
                   sort(c("Developing_location-based",
                          "location-based_services",
                          "Developing_location-based_services")))
  expect_identical(sort(paper_title_ngrams("Standardised geo-sensor webs", STOPS)),
                   sort(c("Standardised_geo-sensor", "geo-sensor_webs",
                          "Standardised_geo-sensor_webs")))
})

# --- no-op regression ----------------------------------------------------
#
# The pre-change tokenizers, reimplemented verbatim: punctuation was replaced by
# spaces ("[^[:alnum:]-]") and n-grams were formed over the whole string. For a
# title with no boundary punctuation and no stripped characters the two
# implementations must agree exactly - the change is a no-op there.

legacy_keep <- function(grams, stops_lower) {
  vapply(grams, function(g) {
    toks <- strsplit(g, "_", fixed = TRUE)[[1]]
    length(toks) >= 2 &&
      !(tolower(toks[1]) %in% stops_lower) &&
      !(tolower(toks[length(toks)]) %in% stops_lower) &&
      toks[1] != toks[length(toks)]
  }, logical(1), USE.NAMES = FALSE)
}

legacy_ngram_candidates <- function(text, stops, ngram_lengths = c(2, 3),
                                    include_unigrams = FALSE) {
  text <- if (is.na(text)) "" else text
  text <- sanitize_corpus_noise(decode_html_entities(text))
  clean <- trimws(gsub("\\s+", " ", gsub("[^[:alnum:]-]", " ", text)))
  if (!nzchar(clean)) return(character(0))
  stops_lower <- tolower(stops)
  grams <- unlist(lapply(ngram_lengths, function(n) expand_ngrams(clean, n)))
  grams <- unlist(strsplit(paste(grams, collapse = " "), " "))
  grams <- grams[nzchar(grams)]
  out <- grams[legacy_keep(grams, stops_lower)]
  if (include_unigrams) {
    words <- strsplit(clean, " ", fixed = TRUE)[[1]]
    words <- words[nzchar(words) & !(tolower(words) %in% stops_lower) &
                     !grepl("^[0-9]+$", words)]
    out <- c(words, out)
  }
  out
}

legacy_paper_title_ngrams <- function(title, stops) {
  clean <- trimws(gsub("\\s+", " ",
                       gsub("[^[:alnum:]-]", " ", if (is.na(title)) "" else title)))
  if (!nzchar(clean)) return(character(0))
  grams <- unlist(c(expand_ngrams(clean, 2), expand_ngrams(clean, 3)))
  grams <- unlist(strsplit(paste(grams, collapse = " "), " "))
  grams <- grams[nzchar(grams)]
  if (!length(grams)) return(character(0))
  unique(grams[legacy_keep(grams, stops)])
}

# Real punctuation-free titles from the four corpora (BASE, ORCID, PubMed,
# OpenAIRE)
CLEAN_TITLES <- c(
  "Zur Entwicklung der Altersarmut in Deutschland",
  "Leading Online Education from Participation to Success",
  "Information Geometry and Evolutionary Game Theory",
  "Reducible and nonsensical uses of game theory",
  "Experiences of autistic children with technologies",
  "Workshop on Computational User Models for Work",
  "A Computational Method for Indoor Landmark Extraction",
  "Evolution of reciprocity with limited payoff memory",
  "WHO Housing and Health Guidelines",
  "List Public communication to specialized and general audiences",
  "Opening Up The Research Lifecycle",
  "Report on Global Data Retrieval",
  "Comparing SSH vocabularies and their applications in different systems"
)

test_that("mode-0 inline title n-grams (get_title_ngrams) respect segmentation", {
  segs <- lapply(list(
    "Urban Emotions: Benefits and Risks for Urban Planning",
    "Digitale Transformation der Lehre an Hochschulen – ein Werkstattbericht"
  ), punctuation_segments)
  out <- unlist(get_title_ngrams(segs, STOPS, c(2, 3)))
  grams <- unlist(strsplit(out, "[ ;]"))
  # no n-gram crosses the colon / spaced en dash
  expect_false(any(grepl("Emotions_Benefits", grams, fixed = TRUE)))
  expect_false(any(grepl("Hochschulen_ein", grams, fixed = TRUE)))
  # within-segment n-grams survive
  expect_true("Urban_Emotions" %in% grams)
  expect_true("Digitale_Transformation" %in% grams)
})

test_that("no-op: clean titles are byte-identical to the pre-change output", {
  expect_true(length(CLEAN_TITLES) >= 10)
  for (t in CLEAN_TITLES) {
    expect_identical(ngram_candidates(t, STOPS),
                     legacy_ngram_candidates(t, STOPS))
    expect_identical(ngram_candidates(t, STOPS, include_unigrams = TRUE),
                     legacy_ngram_candidates(t, STOPS, include_unigrams = TRUE))
    expect_identical(paper_title_ngrams(t, STOPS),
                     legacy_paper_title_ngrams(t, STOPS))
  }
})

# --- adversarial / robustness -------------------------------------------------

test_that("control characters in the source cannot forge placeholders", {
  # \x01/\x03 are the chain-period and kept-colon placeholders, \x02 the
  # boundary marker: a source string carrying them must not gain a period or a
  # colon, and must not be split by them - they are inert whitespace
  expect_equal(seg("alpha\x01beta gamma"), "alpha beta gamma")
  expect_equal(seg("alpha\x03beta gamma"), "alpha beta gamma")
  expect_equal(seg("alpha\x02beta gamma"), "alpha beta gamma")
  expect_false(any(grepl("[.:]", seg("alpha\x01beta\x03gamma"))))
  # tab/newline/CR keep their whitespace meaning
  expect_equal(seg("first line\nsecond\tline"), "first line second line")
})

test_that("invisible characters do not fork a token's identity", {
  expect_identical(ngram_candidates("co­operation between states", STOPS),
                   ngram_candidates("cooperation between states", STOPS))
  expect_identical(ngram_candidates("data​science methods today", STOPS),
                   ngram_candidates("datascience methods today", STOPS))
  expect_equal(seg("﻿Leading edge research"), "Leading edge research")
})

test_that("degenerate inputs return an empty result, never an error", {
  for (x in list("", "   ", "...!?", "-", NA, NA_character_, NULL)) {
    expect_identical(seg(x), character(0))
  }
  expect_identical(ngram_candidates(NA, STOPS), character(0))
  expect_identical(paper_title_ngrams(NA, STOPS), character(0))
})

test_that("keep-list matching is whole-token and survives surrounding punctuation", {
  expect_equal(seg("a (80:20) split of data"), c("a", "80:20", "split of data"))
  expect_equal(seg("80:20"), "80:20")
  # a near-miss must NOT be protected by the keep-list entry it resembles
  expect_equal(seg("ratio 800:20 here"), c("ratio 800", "20 here"))
  expect_equal(seg("x80:20y here"), c("x80", "20y here"))
})

test_that("abbreviation-chain protection does not overreach", {
  expect_equal(seg("U.S.-based policy research"), "U.S.-based policy research")
  expect_equal(seg("in the U.S., and beyond"), c("in the U.S.", "and beyond"))
  # a chain glued to a preceding word is not an abbreviation
  expect_equal(seg("aU.S. policy"), c("aU.S", "policy"))
  # three hyphens are a run, not a compound
  expect_equal(seg("word---word here"), c("word", "word here"))
})

test_that("a quoted inner word is isolated (documented P22 behaviour)", {
  # both quotes are spaced on their outer side, so the quoted word becomes its
  # own segment and the phrase around it does not form n-grams. Pinned so any
  # future "transparent quote pair" rule is a deliberate change, not a drift.
  expect_equal(seg("Wirtschaftspolitik \"schlägt\" Sozialpolitik"),
               c("Wirtschaftspolitik", "schlägt", "Sozialpolitik"))
  expect_equal(seg("the 'best' method for testing"),
               c("the", "best", "method for testing"))
  # the apostrophe inside a word is unaffected by this
  expect_equal(seg("the author's best method"), "the author's best method")
})

test_that("non-Latin scripts pass through untouched", {
  expect_equal(seg("دراسة حول التعليم الرقمي"), "دراسة حول التعليم الرقمي")
  expect_equal(seg("机器学习 在 教育 中的 应用"), "机器学习 在 教育 中的 应用")
})

test_that("pathological punctuation runs terminate", {
  expect_identical(seg(strrep("?!.", 400)), character(0))
  expect_equal(seg(paste0("start ", strrep("-", 20), " end")), c("start", "end"))
  # beyond 80 non-space chars the existing corpus-noise guard removes the run
  # before segmentation sees it, so it degrades to whitespace, not a boundary
  expect_equal(seg(paste0("start ", strrep("-", 300), " end")), "start end")
})

test_that("control: the legacy reimplementation does differ on punctuation", {
  # guards that the no-op assertions above are not comparing two identical
  # code paths - on a punctuated title the implementations must diverge
  t <- "Wind Energy in Germany: Potential Areas"
  expect_false(identical(ngram_candidates(t, STOPS),
                         legacy_ngram_candidates(t, STOPS)))
  expect_true("Germany_Potential" %in% legacy_ngram_candidates(t, STOPS))
})
