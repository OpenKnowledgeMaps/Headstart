# ranking.R
# Area-title ranking modes (see docs/area_title_ranking_plan.md).
#
# Stage 0 wiring only: the per-integration config resolver `ranking_mode()` and
# the selection wedge `select_cluster_label_names()`. The wedge is a NO-OP for
# Mode 0 (the unchanged legacy selection) and, until the rank-aware selection
# lands (Stage 1+), falls back to the legacy selection for Modes 1-3 so an early
# config flag can never break labelling.
#
# This file is deliberately pure base R (no packages, no logging) so it can be
# sourced and unit-tested in isolation, mirroring subject_cleaning.R.

RANKING_MODES <- c("0", "1", "2", "3")

# Resolve the ranking mode for a data integration. Precedence:
#   1. per-integration override  RANKING_MODE_<SERVICE>  (e.g. RANKING_MODE_BASE)
#   2. global                    RANKING_MODE
#   3. default                   "0" (legacy)
# A value is only honoured if it is one of RANKING_MODES; an invalid value at one
# level falls through to the next, and if nothing valid is set the function
# returns "0". It warns only when something *was* configured but nothing valid
# resolved, so a misconfiguration degrades safely to legacy instead of breaking.
#   service : integration name (e.g. "base", "pubmed", "orcid", "openaire"); the
#             env var is RANKING_MODE_<toupper(service)>. NULL/"" skips step 1.
ranking_mode <- function(service = NULL) {
  pick <- function(v) if (nzchar(v) && v %in% RANKING_MODES) v else NA_character_

  raw_svc <- if (!is.null(service) && nzchar(service)) {
    Sys.getenv(paste0("RANKING_MODE_", toupper(service)))
  } else {
    ""
  }
  raw_glob <- Sys.getenv("RANKING_MODE")

  mode <- pick(raw_svc)
  if (is.na(mode)) mode <- pick(raw_glob)
  if (!is.na(mode)) return(mode)

  # nothing valid resolved; warn if the user set *something*
  if (nzchar(raw_svc) || nzchar(raw_glob)) {
    msg <- sprintf(
      "ranking_mode: no valid ranking mode for service '%s' (per-integration='%s', global='%s'); using legacy mode 0",
      if (is.null(service)) "" else service, raw_svc, raw_glob)
    if (exists("logwarn")) logwarn(msg) else warning(msg)
  }
  "0"
}

# Selection wedge: turn the per-cluster ranked tf-idf term lists into display
# labels according to `mode`. Mode 0 is the unchanged legacy selection
# (`legacy_fn`, default get_top_names). Modes 1-3 will apply rank-aware selection;
# until that lands they fall back to `legacy_fn` with a warning (Stage 0), so the
# pipeline is never broken by an early config flag.
#   tfidf_top : per-cluster named, descending tf-idf term lists.
#   top_n     : number of terms kept per label.
#   stops     : stopword vector.
#   mode      : ranking mode string (see RANKING_MODES).
#   legacy_fn : the legacy selector; injectable for testing.
select_cluster_label_names <- function(tfidf_top, top_n, stops, mode = "0",
                                        legacy_fn = get_top_names) {
  if (identical(mode, "0")) {
    return(legacy_fn(tfidf_top, top_n, stops))
  }
  msg <- sprintf(
    "select_cluster_label_names: ranking mode '%s' not yet implemented (Stage 0); using legacy selection",
    mode)
  if (exists("vslog")) vslog$warn(msg) else if (exists("logwarn")) logwarn(msg) else warning(msg)
  legacy_fn(tfidf_top, top_n, stops)
}
