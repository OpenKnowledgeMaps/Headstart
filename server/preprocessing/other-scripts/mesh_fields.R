# mesh_fields.R
# Shared, reusable production of the MeSH rank-provenance metadata columns used by
# ranking Modes 2/3 (docs/area_title_ranking_plan.md §11). Data integrations
# (base.R, and later pubmed/openaire) `source()` this file and call
# add_mesh_rank_fields(metadata) once they have populated `subject_orig` (the RAW,
# still-[MeSH]-marked subject). It adds two ADDITIVE columns and leaves
# `subject` / `subject_orig` untouched:
#
#   keywords_rank_mesh_specific : "; "-joined descriptors classified "specific"
#   keywords_rank_mesh_generic  : "; "-joined descriptors classified "generic"
#
# Form handling (verified against real BASE data):
#   * CLASSIFY on the qualifier-stripped ORIGINAL form. BASE presents official MeSH
#     descriptors, including legitimate comma-terms ("History, 21st Century") that
#     de-inversion would mangle and break the mesh_tree_depth lookup — so we do NOT
#     de-invert before classifying (mesh_classification.R keys the official forms).
#   * STORE the cleaned form = strip_qualifier(deinvert(original)), i.e. the SAME
#     transform base.R applies to build `subject_cleaned`, so the ranking's membership
#     test (get_cluster_corpus: mesh token must be a subject token) actually lands.
#
# Pure of pipeline state; depends only on the shared classifier + cleaning helpers.

if (!exists("classify_mesh"))      source("mesh_classification.R")
if (!exists("deinvert_mesh_term")) source("subject_cleaning.R")

# NB: keep these two names in sync with summarize.R (the consumer).
if (!exists("KW_MESH_SPECIFIC")) KW_MESH_SPECIFIC <- "keywords_rank_mesh_specific"
if (!exists("KW_MESH_GENERIC"))  KW_MESH_GENERIC  <- "keywords_rank_mesh_generic"

MESH_MARKER_RE <- "\\s*(\\[MeSH\\]|\\(mesh\\))\\s*"

# The [MeSH]/(mesh)-marked descriptors of one raw subject string, in ORIGINAL form
# (marker removed, otherwise untouched). "" / NA -> character(0).
marked_mesh_descriptors <- function(subject_orig) {
  if (is.null(subject_orig) || is.na(subject_orig) || !nzchar(subject_orig)) return(character(0))
  kws <- trimws(strsplit(subject_orig, ";", fixed = TRUE)[[1]])
  kws <- kws[grepl("\\[MeSH\\]|\\(mesh\\)", kws, ignore.case = TRUE)]
  desc <- trimws(gsub(MESH_MARKER_RE, "", kws, ignore.case = TRUE, perl = TRUE))
  desc[nzchar(desc)]
}

# Add keywords_rank_mesh_specific / _generic to `metadata`, derived from
# metadata$subject_orig. If subject_orig is absent the columns are added empty, so
# Modes 2/3 degrade cleanly to Mode-1 behaviour (get_cluster_corpus: has_mesh = FALSE).
add_mesh_rank_fields <- function(metadata) {
  so <- metadata$subject_orig
  if (is.null(so)) {
    metadata[[KW_MESH_SPECIFIC]] <- rep("", nrow(metadata))
    metadata[[KW_MESH_GENERIC]]  <- rep("", nrow(metadata))
    return(metadata)
  }
  spec <- character(length(so)); gen <- character(length(so))
  for (i in seq_along(so)) {
    orig <- marked_mesh_descriptors(so[i])
    if (!length(orig)) { spec[i] <- ""; gen[i] <- ""; next }
    # classify: qualifier-stripped ORIGINAL (comma-inversion preserved) -> tsv match.
    classify_form <- trimws(strip_mesh_qualifier(orig))
    # store: same transform as subject_cleaned (deinvert THEN strip qualifier).
    stored_form <- trimws(strip_mesh_qualifier(vapply(orig, deinvert_mesh_term, character(1), USE.NAMES = FALSE)))
    cls <- classify_mesh(classify_form)   # "generic" / "specific", vectorised
    spec[i] <- paste(unique(stored_form[cls == "specific" & nzchar(stored_form)]), collapse = "; ")
    gen[i]  <- paste(unique(stored_form[cls == "generic"  & nzchar(stored_form)]), collapse = "; ")
  }
  metadata[[KW_MESH_SPECIFIC]] <- spec
  metadata[[KW_MESH_GENERIC]]  <- gen
  metadata
}
