# mesh_classification.R
#
# Classify MeSH descriptors as "specific" or "generic" for area-title ranking.
# A descriptor is GENERIC if it is a
# check tag (Humans, Animals, Male, …) OR its minimum MeSH tree depth is <= a
# threshold (top levels of the classification); everything else — including
# descriptors we cannot find in the tree — is SPECIFIC, so we never demote a term
# we failed to classify.
#
# Pure base R (no packages), so it can be sourced and unit-tested in isolation
# (mirrors subject_cleaning.R). Lookups are lazy-loaded once from:
#   resources/mesh_tree_depth.tsv   (descriptor \t min_depth \t max_depth \t n_locations)
#   resources/mesh_check_tags.txt   (one check tag per line)
#
# Lookup is by the MeSH descriptor's ORIGINAL form (as it appears in the NLM
# descriptor list, e.g. "Adaptation, Physiological"), matched case-insensitively —
# so classify BEFORE de-inverting/normalising the term.

# Descriptors at min tree depth <= this are "generic". Depth = number of
# dot-separated components of a tree number ("C04.588" = depth 2).
MESH_GENERIC_MAX_DEPTH <- 2L

.mesh_env <- new.env(parent = emptyenv())

# Find the resources directory the same way get_stopwords() does.
mesh_resources_dir <- function() {
  for (d in c("../resources", "./resources", "../../resources")) {
    if (dir.exists(d)) return(d)
  }
  stop("mesh_classification: could not locate the resources/ directory")
}

# Load the tree-depth and check-tag lookups once (idempotent). `resources_dir`
# overrides the auto-detected path (used by tests).
load_mesh_resources <- function(resources_dir = NULL, force = FALSE) {
  if (!force && !is.null(.mesh_env$depth)) return(invisible(NULL))
  dir <- if (is.null(resources_dir)) mesh_resources_dir() else resources_dir
  d <- read.delim(file.path(dir, "mesh_tree_depth.tsv"), stringsAsFactors = FALSE,
                  quote = "", colClasses = c("character", "integer", "integer", "integer"))
  .mesh_env$depth <- stats::setNames(d$min_depth, tolower(d$descriptor))
  tags <- readLines(file.path(dir, "mesh_check_tags.txt"), warn = FALSE)
  tags <- tolower(trimws(tags))
  .mesh_env$checktags <- tags[nzchar(tags)]
  invisible(NULL)
}

# Minimum MeSH tree depth of a descriptor (original form), or NA if absent.
mesh_min_depth <- function(descriptor) {
  load_mesh_resources()
  unname(.mesh_env$depth[tolower(trimws(descriptor))])
}

# TRUE if the descriptor is a "generic" MeSH term (check tag or shallow tree depth).
# Vectorised over `descriptor`.
is_generic_mesh <- function(descriptor) {
  load_mesh_resources()
  key <- tolower(trimws(descriptor))
  d <- .mesh_env$depth[key]
  unname((key %in% .mesh_env$checktags) | (!is.na(d) & d <= MESH_GENERIC_MAX_DEPTH))
}

# Classify each descriptor as "generic" or "specific". Vectorised.
classify_mesh <- function(descriptors) {
  ifelse(is_generic_mesh(descriptors), "generic", "specific")
}
