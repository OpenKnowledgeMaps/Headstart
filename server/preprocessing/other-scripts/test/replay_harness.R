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
    metadata           = bundle$metadata,
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
fixture_files <- function() list.files(REPLAY_DIR, pattern = "\\.inputs\\.rds$", full.names = TRUE)
fixture_name  <- function(path) sub("\\.inputs\\.rds$", "", basename(path))
expected_file <- function(name) file.path(REPLAY_DIR, paste0(name, ".expected.rds"))
read_expected <- function(name) readRDS(expected_file(name))
write_expected <- function(name, labels) {
  dir.create(REPLAY_DIR, showWarnings = FALSE, recursive = TRUE)
  saveRDS(labels, expected_file(name))
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
