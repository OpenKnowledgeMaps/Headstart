#!/usr/bin/env Rscript
# Mine the replay fixtures for clusters where the MeSH-aware ranking (Modes 2/3)
# actually fires, and classify WHY. For each cluster whose Mode-3 label differs from
# Mode-1 it prints the m1/m2/m3 labels, the per-cluster MeSH rank sources, and tags:
#   GENERIC-DEMOTE : an m1 label term that is a GENERIC MeSH token is gone in m3
#   SPECIFIC-TOPUP : an m3 label term is a SPECIFIC MeSH token not in the m1 label
#   CROSS-BACKFILL : an m3 specific-MeSH term string-contains an m1 keyword (replaced)
#   MODE3-DISTINCT : m3 differs from m2 (the specific-MeSH-own-rank / cross-denest split)
#
#   R_PROFILE_USER=/dev/null Rscript test/mine_mode3.R [fixture.inputs.rds ...]

suppressWarnings(suppressMessages(source("test/replay_harness.R")))

norm  <- function(x) gsub(" ", "_", tolower(trimws(x)))
terms <- function(lbl) { t <- trimws(strsplit(as.character(lbl), ",")[[1]]); t[nzchar(t)] }

# Per-cluster rank sources (MeSH columns derived from subject_orig, as base.R does).
cluster_sources <- function(b) {
  md <- add_mesh_rank_fields(backfill_subject_is_heuristic(b$metadata))
  md$keywords_rank_cleaned <- md$subject
  get_cluster_corpus(b$clusters, md, b$stops, b$taxonomy_separator, heuristic_col = HEUR_MIN2)$rank_sources
}

mine <- function(p) {
  b  <- readRDS(p); name <- fixture_name(p)
  rs <- cluster_sources(b)
  m1 <- replay_labels(b, "1"); m2 <- replay_labels(b, "2"); m3 <- replay_labels(b, "3")
  for (k in names(m1)) {
    if (identical(unname(m1[k]), unname(m3[k]))) next          # Mode 3 not applied here
    ci <- as.integer(k)
    spec <- rs$mesh_specific[[ci]]; gen <- rs$mesh_generic[[ci]]
    t1 <- terms(m1[k]); t3 <- terms(m3[k])
    tags <- character(0)
    if (any(norm(setdiff(t1, t3)) %in% gen))  tags <- c(tags, "GENERIC-DEMOTE")
    if (any(norm(setdiff(t3, t1)) %in% spec)) tags <- c(tags, "SPECIFIC-TOPUP")
    for (a in t3[norm(t3) %in% spec]) for (bt in t1)
      if (a != bt && grepl(bt, a, fixed = TRUE)) tags <- c(tags, "CROSS-BACKFILL")
    if (!identical(unname(m2[k]), unname(m3[k]))) tags <- c(tags, "MODE3-DISTINCT")
    tags <- unique(tags); if (!length(tags)) tags <- "OTHER"
    cat(sprintf("\n[%s]  %s  cl%s\n", paste(tags, collapse = ","), name, k))
    cat("   m1:", m1[k], "\n   m2:", m2[k], "\n   m3:", m3[k], "\n")
    if (length(spec)) cat("   specific MeSH:", paste(head(gsub("_", " ", spec), 8), collapse = " | "), "\n")
    if (length(gen))  cat("   generic  MeSH:", paste(head(gsub("_", " ", gen), 8), collapse = " | "), "\n")
  }
  gc(FALSE)
}

args <- commandArgs(trailingOnly = TRUE)
files <- if (length(args)) args else grep(
  "base_cancer_fallback|base_cancer_research|orcid_5116955x\\.|orcid_96127791\\.|orcid_42216275|orcid_45050517|orcid_39246636|orcid_89117832|orcid_22336926|orcid_90626039",
  fixture_files(), value = TRUE)
for (f in files) mine(f)
