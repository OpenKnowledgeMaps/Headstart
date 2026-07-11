#!/usr/bin/env Rscript
# Generate a Mode-1 ORCID review list: 1-2 example clusters per ORCID fixture.
#
# For every orcid_*.inputs.rds bundle, replay Mode-1 selection and pick up to two
# clusters worth eyeballing on the dev server, preferring the situations that
# actually exercise the ranking (rank-1 exclusivity, rank-2 fallback, de-nesting)
# over plain single-rank labels. Prints the reconstructed ORCID suffix so the map
# is findable.
#
#   R_PROFILE_USER=/dev/null Rscript test/orcid_review_list.R

suppressWarnings(suppressMessages(source("test/mine_cases.R")))

MAX_PER_ORCID <- 2

# orcid_5116955x -> "....-5116-955X"; orcid_96127791 -> "....-9612-7791"
orcid_suffix <- function(name) {
  s <- toupper(sub("^orcid_", "", sub("_r2$", "", name)))
  paste0("....-", substr(s, 1, 4), "-", substr(s, 5, 8))
}

# Rank a cluster by how interesting it is to review (higher = pick first).
cluster_score <- function(c) {
  denest  <- FALSE
  sel <- if (length(c$r1) > 0) c$r1 else c$r2
  top <- head(sel, 6)
  for (i in seq_along(top)) for (j in seq_along(top))
    if (i != j && is_nested(top[i], top[j])) denest <- TRUE
  fallback  <- length(c$r1) == 0 && length(c$r2) > 0
  exclusive <- length(c$r1) > 0 && length(c$r2) > 0
  tag <- c(if (denest) "DE-NEST", if (fallback) "RANK2-FALL",
           if (exclusive) "RANK1-ONLY")
  score <- 3 * denest + 2 * fallback + 1 * exclusive
  list(score = score, tag = if (length(tag)) paste(tag, collapse = ",") else "PLAIN")
}

fixtures <- sort(grep("orcid_", fixture_files(), value = TRUE))

for (path in fixtures) {
  name <- fixture_name(path)
  cand <- cluster_candidates(readRDS(path))

  rows <- list()
  for (k in seq_along(cand)) {
    c <- cand[[k]]; if (is.null(c) || !nzchar(c$label)) next
    sc <- cluster_score(c)
    rows[[length(rows) + 1]] <- list(k = k, c = c, score = sc$score, tag = sc$tag)
  }
  cat(sprintf("\n=== %s  (%s)  [%d labelled clusters] ===\n",
              name, orcid_suffix(name), length(rows)))
  if (!length(rows)) { cat("   (no labelled clusters)\n"); next }

  ord <- order(-vapply(rows, function(r) r$score, numeric(1)))
  picks <- head(rows[ord], MAX_PER_ORCID)
  for (r in picks) {
    cat(sprintf("   cluster %-2d [%s]  ->  %s\n", r$k, r$tag, r$c$label))
    cat("      rank1:", fmt(r$c$r1, 6), "\n")
    cat("      rank2:", fmt(r$c$r2, 6), "\n")
  }
}
