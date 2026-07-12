# Replay harness for area-title labelling.
#
# Loads a captured input bundle (summarize_00_label_inputs.rds, produced by a
# LOGLEVEL=DEBUG run) and replays create_cluster_labels() offline under a chosen
# ranking mode. Because the input is frozen, label output is deterministic and
# independent of BASE/PubMed/etc. — so we can:
#   - regression-test Mode-0 stability across code edits (expected-output files), and
#   - compare modes A/B on identical input (the staged "reviewables").
#
# Runs ONLY inside the pipeline image (needs tm/stringr/logging/parallel) and with
# the renv profile bypassed so the site-library packages are importable — use
# test/run_tests.sh, which sets R_PROFILE_USER=/dev/null. Not pure base R.

suppressWarnings(suppressMessages({
  library(tm)
  library(stringr)
  library(parallel)
}))

# Source the pipeline pieces create_cluster_labels needs. Order matters only in
# that ranking.R's default legacy_fn (get_top_names) is resolved at call time.
if (!exists("dump_data"))              source("utils.R")
if (!exists("create_cluster_labels")) source("summarize.R")
if (!exists("ranking_mode"))          source("ranking.R")

REPLAY_DIR <- "test/replay"

# Fixtures captured BEFORE the replace_keywords_if_empty routing fix lack the
# `subject_is_heuristic` flag, so get_cluster_corpus falls back to treating every
# subject as a real keyword (rank 1) — including subjects that were synthesised from
# titles for keyword-less papers. That mis-labels complete-fallback clusters as
# rank-1 situations. These fixtures still carry `subject_orig` (the subject BEFORE
# synthesis), so reconstruct the flag the same way preprocess.R does: a paper whose
# ORIGINAL subject was empty had its subject synthesised and must route to the
# heuristic (rank-2) source. No-op once fixtures are captured post-fix (flag present)
# and harmless in Mode 0 (the flag only affects rank sources, not the tf-idf corpus).
backfill_subject_is_heuristic <- function(metadata) {
  if ("subject_is_heuristic" %in% names(metadata)) return(metadata)
  if (!"subject_orig" %in% names(metadata))        return(metadata)
  so <- metadata$subject_orig
  metadata$subject_is_heuristic <- nchar(ifelse(is.na(so), "", so)) <= 1
  metadata
}

# Reduce clusters$cluster_labels (one entry per paper) to a deterministic,
# cluster-keyed vector: one label per cluster id, ordered by id.
labels_per_cluster <- function(clusters) {
  df <- unique(data.frame(cluster = clusters$groups,
                          label   = clusters$cluster_labels,
                          stringsAsFactors = FALSE))
  df <- df[order(df$cluster), ]
  stats::setNames(df$label, df$cluster)
}

# Replay a fixture bundle (path or list) under a forced ranking mode; returns the
# per-cluster labels. Forces the mode via the real ranking_mode() env path and
# disables debug dumps during replay, restoring the environment afterwards.
replay_labels <- function(bundle, mode = "0") {
  if (is.character(bundle)) bundle <- readRDS(bundle)

  rk <- grep("^RANKING_MODE", names(Sys.getenv()), value = TRUE)
  saved <- Sys.getenv(c(rk, "LOGLEVEL"), names = TRUE)
  on.exit({
    if (length(rk)) Sys.unsetenv(rk)
    do.call(Sys.setenv, as.list(saved))
  }, add = TRUE)
  if (length(rk)) Sys.unsetenv(rk)
  Sys.setenv(RANKING_MODE = mode, LOGLEVEL = "INFO")  # INFO => dump_data() no-ops

  clusters <- create_cluster_labels(
    clusters           = bundle$clusters,
    metadata           = backfill_subject_is_heuristic(bundle$metadata),
    type_counts        = bundle$type_counts,
    weightingspec      = bundle$weightingspec,
    top_n              = bundle$top_n,
    stops              = bundle$stops,
    taxonomy_separator = bundle$taxonomy_separator,
    params             = bundle$params,
    service            = bundle$service)
  labels_per_cluster(clusters)
}

# File helpers. Fixtures:            test/replay/<name>.inputs.rds
#              expected Mode-0 out:  test/replay/<name>.expected.rds
#              expected Mode-N out:  test/replay/<name>.expected.modeN.rds   (N = 1,2,3)
# Mode 0 keeps the bare ".expected.rds" name for backward compatibility with the
# baselines committed before ranked-mode baselining existed.
fixture_files <- function() list.files(REPLAY_DIR, pattern = "\\.inputs\\.rds$", full.names = TRUE)
fixture_name  <- function(path) sub("\\.inputs\\.rds$", "", basename(path))
expected_file <- function(name, mode = "0") {
  suffix <- if (identical(mode, "0")) ".expected.rds" else paste0(".expected.mode", mode, ".rds")
  file.path(REPLAY_DIR, paste0(name, suffix))
}
read_expected <- function(name, mode = "0") readRDS(expected_file(name, mode))
write_expected <- function(name, labels, mode = "0") {
  dir.create(REPLAY_DIR, showWarnings = FALSE, recursive = TRUE)
  saveRDS(labels, expected_file(name, mode))
}

# Is `a` a contiguous run of words inside `b` (word-sequence containment)?
is_nested <- function(a, b) {
  a != b && grepl(paste0(" ", a, " "), paste0(" ", b, " "), fixed = TRUE)
}

# Per-cluster Mode-1 breakdown for a fixture bundle, computed exactly as
# create_cluster_labels does (initial corpus = min2, fallback = min1, bound
# c(1,Inf)). Returns list(clusters, unknown_total) where each cluster entry is
# list(r1, r2, label): the rank-1 / rank-2 candidate terms (space form,
# tf-idf-weight-ordered) and the resulting Mode-1 area label. Shared by the miner
# (mine_cases.R) and the Mode-1 regression tests.
mode1_cluster_breakdown <- function(bundle) {
  md <- add_heuristic_keyword_fields(bundle$metadata, bundle$stops)
  md$keywords_rank_cleaned <- md$subject
  co <- get_cluster_corpus(bundle$clusters, md, bundle$stops, bundle$taxonomy_separator,
                           heuristic_col = HEUR_MIN2)
  tdm <- TermDocumentMatrix(co$corpus, control = list(
    tokenize = SplitTokenizer, weighting = function(x) weightSMART(x, spec = "ntn"),
    bounds = list(local = c(1, Inf)), tolower = TRUE))
  tt <- apply(tdm, 2, function(x) { x2 <- sort(x, TRUE); x2[x2 > 0] })
  empty <- which(apply(tdm, 2, sum) == 0)
  if (length(empty)) {
    fb <- get_cluster_corpus(bundle$clusters, md, bundle$stops, bundle$taxonomy_separator,
                             heuristic_col = HEUR_MIN1)$corpus
    tt[empty] <- fill_empty_clusters(fb)[empty]
  }
  spec <- rank_spec("1")
  out <- vector("list", length(tt)); unknown_total <- 0L
  for (k in seq_along(tt)) {
    nms <- names(tt[[k]]); if (is.null(nms) || !length(nms)) next
    pruned <- unlist(another_prune_ngrams(nms, bundle$stops)); if (!length(pruned)) next
    sources_k <- lapply(co$rank_sources, function(src) src[[k]])
    rr <- rank_of_terms(pruned, sources_k, spec)
    unknown_total <- unknown_total + rr$unknown
    sp <- trimws(gsub("_", " ", pruned))
    lt <- select_by_rank(pruned, rr$ranks, 3, spec)   # selected label terms (space form)
    out[[k]] <- list(r1 = sp[rr$ranks == 1], r2 = sp[rr$ranks == 2],
                     label_terms = lt, label = format_label(lt))
  }
  list(clusters = out, unknown_total = unknown_total)
}

# Per-cluster Mode-0 fallback breakdown: the label each cluster would get from the
# min2 (initial) corpus vs. the min1 (fallback) corpus, under the Mode-0 bound
# c(2, Inf). Used to test the fallback trigger — a cluster whose min2 label is
# empty but whose min1 label is not must end up with the min1 label, NOT the
# abstract-frequency fallback (see create_cluster_labels). Returns list(min2, min1),
# each a per-cluster character vector.
mode0_fallback_breakdown <- function(bundle) {
  md <- add_heuristic_keyword_fields(bundle$metadata, bundle$stops)
  md$keywords_rank_cleaned <- md$subject
  co2 <- get_cluster_corpus(bundle$clusters, md, bundle$stops, bundle$taxonomy_separator,
                            heuristic_col = HEUR_MIN2)
  tdm2 <- TermDocumentMatrix(co2$corpus, control = list(
    tokenize = SplitTokenizer, weighting = function(x) weightSMART(x, spec = "ntn"),
    bounds = list(local = c(2, Inf)), tolower = TRUE))
  tt2 <- apply(tdm2, 2, function(x) { x2 <- sort(x, TRUE); x2[x2 > 0] })
  min2 <- unlist(get_top_names(tt2, 3, bundle$stops))

  co1 <- get_cluster_corpus(bundle$clusters, md, bundle$stops, bundle$taxonomy_separator,
                            heuristic_col = HEUR_MIN1)
  min1 <- unlist(get_top_names(fill_empty_clusters(co1$corpus), 3, bundle$stops))
  list(min2 = min2, min1 = min1)
}

# A small, self-contained input bundle for validating the harness without any
# external data: two clearly-separated clusters (climate vs. machine learning).
build_synthetic_bundle <- function() {
  metadata <- data.frame(
    title = c(
      "Climate change and sea level rise",
      "Global warming and climate change trends",
      "Sea level rise projections under climate change",
      "Deep learning for image recognition",
      "Neural network training for machine learning",
      "Machine learning applications and neural networks"),
    subject = c(
      "climate change; sea level rise",
      "climate change; global warming",
      "climate change; sea level rise",
      "machine learning; neural networks",
      "machine learning; deep learning",
      "machine learning; neural networks"),
    paper_abstract = c(
      "climate change drives sea level rise across coastal regions",
      "global warming and climate change increase temperatures",
      "projections of sea level rise under continued climate change",
      "deep learning improves image recognition accuracy",
      "training neural networks for machine learning tasks",
      "machine learning applications using neural networks"),
    stringsAsFactors = FALSE)

  clusters <- list(groups = c(1, 1, 1, 2, 2, 2), num_clusters = 2)

  type_counts <- c(Climate = 6, Change = 6, Sea = 4, Level = 4, Rise = 4,
                   Global = 2, Warming = 2, Machine = 6, Learning = 6,
                   Neural = 4, Networks = 4, Deep = 2)

  stops <- c("and", "for", "of", "the", "a", "to", "under", "across", "trends",
             "projections", "applications", "using", "improves", "drives")

  list(clusters = clusters, metadata = metadata, type_counts = type_counts,
       weightingspec = "ntn", top_n = 3, stops = stops,
       taxonomy_separator = NULL, params = list(), service = "base")
}
