library(stringr)
vslog <- getLogger('vis.summarize')

# summarize.R
# Cluster labelling for the overview visualisation: turns each cluster of papers
# into a short, human-readable area title. create_cluster_labels() is the entry
# point (called from vis_layout.R); the helpers build a per-cluster text corpus,
# rank candidate terms by tf-idf, prune and de-nest n-grams, and fix casing.
# Tokens are kept ";"-separated throughout because SplitTokenizer (the
# TermDocumentMatrix tokenizer, label_corpus.R) splits terms on ";".
#
# Split by concern; the parts load here so both entry points
# (vis_layout.R and test/replay_harness.R) keep working unchanged:
#   text_hygiene.R     - entity decode, noise stripping, punctuation_segments
#   ngram_generation.R - the shared generator + legacy-quirk emulation
#   label_corpus.R     - heuristic columns, bypass, corpus builders
#   label_casing.R     - final label casing
#   label_debug.R      - DEBUG-gated dump helpers
source("text_hygiene.R")
source("ngram_generation.R")
source("label_corpus.R")
source("label_casing.R")
source("label_debug.R")


# Last-resort label for a cluster that produced no tf-idf label (empty even after
# the min1 fallback): build one from the most frequent bi-/tri-grams of the
# cluster's papers' titles + abstracts. Returns a single ", "-joined label string.
#   matches          : row indices of the cluster's papers in `metadata`.
#   top_n            : number of terms kept.
#   label_exclusions : curated area-label exclusion list (whole-term, case-insensitive)
#                      applied here too so listed terms never survive as a last resort.
title_abstract_fallback_label <- function(matches, metadata, stops, top_n = 3, label_exclusions = character(0), cluster = NA_integer_,
                                          ngram_lengths = c(2, 3)) {
  candidates = mapply(paste, metadata$title[matches], metadata$paper_abstract[matches])
  candidates = lapply(candidates, tolower)
  # n-gram formation on the stopword-retaining stream (see ngram_candidates):
  # keeps digit/hyphen tokens whole and interior stopwords in place; boundary
  # stopword n-grams are pruned inside the helper. ngram_lengths follows the
  # resolved n-gram setting (Setting 0 = c(2, 3), the historical fallback).
  candidates = unlist(lapply(candidates, ngram_candidates, stops = stops,
                             ngram_lengths = ngram_lengths))
  if (!length(candidates)) return("")
  top_ngrams = sort(table(candidates), decreasing = T)
  if (length(label_exclusions)) {                              # whole-term exclusion (see drop_excluded_terms)
    norm <- trimws(tolower(gsub("_", " ", names(top_ngrams))))
    top_ngrams <- top_ngrams[!(norm %in% tolower(trimws(label_exclusions)))]
  }
  # Debug: the title+abstract n-gram candidate pool (n-gram + frequency, post-exclusion)
  # this last-resort fallback selects from. One file per cluster that reaches this path.
  if (!is.na(cluster) && exists("debug_enabled") && debug_enabled() && length(top_ngrams)) {
    tryCatch(dump_data(data.frame(cluster = cluster, term = gsub("_", " ", names(top_ngrams)),
                                  freq = as.integer(top_ngrams), stringsAsFactors = FALSE),
                       paste0("summarize_04g_titleabstract_candidates_c", cluster)),
             error = function(e) NULL)
  }
  summary <- filter_out_nested_ngrams(names(top_ngrams), top_n)
  summary = lapply(summary, FUN = function(x) {paste(unlist(x), collapse="; ")})
  summary = gsub("_", " ", summary)
  paste(summary, collapse=", ")
}


# Entry point: assign a short label ("area title") to every cluster.
# Builds one pseudo-document per cluster from its papers' subjects + title
# n-grams (or a custom field), ranks terms by tf-idf (SMART "ntn"), and keeps the
# top top_n as the label. Clusters with no surviving tf-idf terms fall back to the
# most frequent bi-/tri-grams of their papers' titles and abstracts. Casing is
# then normalised against the corpus.
#   clusters           : list with $groups (cluster id per paper) and $num_clusters.
#   metadata           : data frame with title, subject, paper_abstract (+ optional
#                        custom_clustering / annotations fields named in params).
#   type_counts        : term -> count map, used to restore original casing.
#   top_n              : number of terms kept per label.
#   stops              : stopword vector.
#   taxonomy_separator : if set, taxonomy subjects keep only their last path segment.
#   service            : data integration name (base|pubmed|orcid|openaire|…), used
#                        to resolve the per-integration ranking mode (see ranking.R).
# Returns clusters with $cluster_labels filled: one label per paper, identical
# for all papers in the same cluster.
create_cluster_labels <- function(clusters, metadata,
                                  type_counts,
                                  weightingspec,
                                  top_n, stops, taxonomy_separator="/",
                                  params=NULL, service=NULL) {
  vslog$debug(paste("create_cluster_labels:", clusters$num_clusters, "clusters,",
                    nrow(metadata), "papers"))
  dump_data(clusters, "summarize_01_clusters")
  dump_data(metadata[, intersect(c("id", "title", "subject", "subject_orig", "paper_abstract"),
                                  names(metadata)), drop = FALSE], "summarize_02_metadata")
  dump_data(type_counts, "summarize_03_type_counts")
  # Replay-harness fixture: capture the complete input bundle so this map can be
  # replayed offline under any ranking mode (see test/replay_harness.R). RDS only,
  # debug-gated like the other dumps.
  dump_data(list(clusters = clusters, metadata = metadata, type_counts = type_counts,
                 weightingspec = weightingspec, top_n = top_n, stops = stops,
                 taxonomy_separator = taxonomy_separator, params = params, service = service),
            "summarize_00_label_inputs")
  # Leading "*" (MeSH major-topic marker) can still be attached to subject
  # keywords at this point: source-side cleaning strips it, but merging the
  # subjects of duplicate records can re-introduce a marked spelling. Strip it
  # here, where the subject tokens for the corpus and every rank source
  # originate, so the marked and unmarked spelling of a keyword cannot compete
  # as two distinct candidates. All modes and services.
  if ("subject" %in% names(metadata)) {
    metadata$subject <- strip_major_topic_markers(metadata$subject)
  }
  # Resolve the ranking mode BEFORE building the corpus. Mode 0 keeps the legacy
  # corpus/selection structure (get_cluster_corpus_legacy + zero-sum
  # fill_empty_clusters_legacy, no DF filter); Modes 1-3 take the map-wide
  # DF-filtered (min2/min1) corpus + rank-aware selection. The punctuation-aware
  # title segmentation applies in every mode.
  mode <- ranking_mode(service)
  cc <- params$custom_clustering
  # N-gram setting axis, resolved
  # per service like the ranking mode. Mode 0 always runs Setting 0 (it keeps
  # the legacy corpus/selection structure), and the setting is a no-op on the
  # custom-clustering path (no title n-grams there). Setting 0 leaves every
  # call site on its current behaviour.
  nset <- ngram_setting(service)
  if (identical(mode, "0") && !identical(nset, "0")) {
    # Mode 0 keeps its legacy corpus/selection structure at every setting; a
    # non-0 setting switches ONLY the title n-gram generation step of the
    # legacy corpus builder to the shared generator (synthesis stays part
    # of the mode-0 subject stream — no bypass on this path).
    vslog$info(paste("create_cluster_labels: mode 0 with ngram setting", nset,
                     "- setting switches generation only, structure stays legacy"))
  }
  if (!(is.null(cc)) && (cc %in% names(metadata)) && !identical(nset, "0")) {
    vslog$info(paste("create_cluster_labels: ngram setting", nset,
                     "is a no-op on the custom-clustering path"))
  }
  nset_lengths <- ngram_setting_lengths(nset)
  nset_abstracts <- !identical(nset, "0") && include_abstracts(service)
  vslog$debug(paste("create_cluster_labels: ngram setting", nset,
                    "abstracts", nset_abstracts))
  # Curated area-label exclusion list, applied post-tf-idf / pre-ranking at every
  # candidate-producing tier (initial, fallback, title/abstract) so listed generic
  # terms can never become a label. Applied in EVERY mode, Mode 0 included: a
  # generic term is unwanted as a label regardless of which selection path
  # produced it. See get_label_exclusions.
  label_exclusions <- get_label_exclusions()
  vslog$debug(paste("create_cluster_labels: ranking mode", mode, "for service",
                    if (is.null(service)) "(none)" else service))

  # Tracks which path produced each cluster's label, for summarize_06b_label_provenance:
  # "primary" (tf-idf/ranking), "legacy_fill"/"min1_fallback" (empty-label rescue), or
  # "title_abstract_fallback" (last resort). Updated where each fallback fires.
  label_source <- rep("primary", clusters$num_clusters)

  if (identical(mode, "0")) {
    # ---- Mode 0: legacy no-ranking path (inline title n-grams, no DF filter) ----
    if (!(is.null(cc)) && (cc %in% names(metadata))) {
      nn_corpus <- get_custom_cluster_corpus(clusters, metadata, stops, taxonomy_separator, custom_clustering=cc)$corpus
    } else {
      nn_corpus <- get_cluster_corpus_legacy(clusters, metadata, stops, taxonomy_separator,
                                             ngram_lengths = nset_lengths,
                                             legacy_quirks = identical(nset, "0"))
    }
    dump_data(nn_corpus, "summarize_04_corpus")
    dump_corpus_text(nn_corpus, "summarize_04_corpus_text")
    nn_tfidf <- TermDocumentMatrix(nn_corpus, control = list(
      tokenize = SplitTokenizer,
      weighting = function(x) weightSMART(x, spec="ntn"),
      bounds = list(local = c(2, Inf)),
      tolower = TRUE
    ))
    tfidf_top <- apply(nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>0]})
    # Legacy fallback: clusters whose tf-idf summed to zero are re-filled from the
    # SAME corpus at bound c(1, Inf).
    empty_tfidf <- which(apply(nn_tfidf, 2, sum) == 0)
    tfidf_top[c(empty_tfidf)] <- fill_empty_clusters_legacy(nn_tfidf, nn_corpus)[c(empty_tfidf)]
    dump_tfidf_candidates(tfidf_top, "summarize_04b_tfidf_candidates")   # raw candidates (post empty-fill, pre-exclusion)
    tfidf_top_pre_excl <- tfidf_top
    tfidf_top <- drop_excluded_terms(tfidf_top, label_exclusions)   # post-tf-idf, pre-selection (all modes)
    dump_excluded_terms(tfidf_top_pre_excl, tfidf_top, "summarize_04e_excluded_terms")
    if (length(empty_tfidf)) label_source[empty_tfidf] <- "legacy_fill"
    tfidf_top_names <- get_top_names(tfidf_top, top_n, stops)
  } else {
    # ---- Modes 1-3: DF-filtered corpus + rank-aware selection ------------------
    # Additive rank columns on the metadata data frame:
    #  - keywords_rank_cleaned: the rank-1 source (Stage 1 = subject_cleaned verbatim).
    #  - the two heuristic columns (min1/min2), pre-binned by MAP-WIDE document
    #    frequency (add_heuristic_keyword_fields). subject_cleaned (metadata$subject)
    #    is left untouched.
    # G1 bypass (settings >= 1, non-custom path only): must run BEFORE the
    # heuristic columns and keywords_rank_cleaned are derived from `subject`
    if (!identical(nset, "0") && (is.null(cc) || !(cc %in% names(metadata)))) {
      metadata <- bypass_heuristic_subjects(metadata)
    }
    metadata <- add_heuristic_keyword_fields(metadata, stops,
                                             ngram_lengths = nset_lengths,
                                             include_abstracts = nset_abstracts)
    metadata$keywords_rank_cleaned <- metadata$subject
    if (!(is.null(cc)) && (cc %in% names(metadata))) {
      corpus_out <- get_custom_cluster_corpus(clusters, metadata, stops, taxonomy_separator, custom_clustering=cc)
      fallback_corpus <- corpus_out$corpus   # custom path: no heuristic min1/min2 split
    } else {
      # Initial corpus uses the map-wide min2 heuristic set (DF >= 2); the fallback
      # corpus swaps in min1 (all n-grams).
      corpus_out <- get_cluster_corpus(clusters, metadata, stops, taxonomy_separator, heuristic_col = HEUR_MIN2)
      fallback_corpus <- get_cluster_corpus(clusters, metadata, stops, taxonomy_separator, heuristic_col = HEUR_MIN1)$corpus
    }
    # get_*_cluster_corpus returns the corpus plus per-cluster rank sources (the
    # separated keyword/heuristic tokens used only for rank lookup). rank_sources
    # is NULL on the custom-clustering path, so ranked modes fall back to legacy there.
    nn_corpus <- corpus_out$corpus
    rank_sources <- corpus_out$rank_sources
    dump_data(nn_corpus, "summarize_04_corpus")
    dump_corpus_text(nn_corpus, "summarize_04_corpus_text")
    dump_rank_sources(rank_sources, "summarize_04d_rank_sources")
    # Local bound c(1, Inf) so low-frequency real keywords survive into the ranking.
    nn_tfidf <- TermDocumentMatrix(nn_corpus, control = list(
      tokenize = SplitTokenizer,
      weighting = function(x) weightSMART(x, spec="ntn"),
      bounds = list(local = c(1, Inf)),
      tolower = TRUE
    ))
    tfidf_top <- apply(nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>0]})
    dump_tfidf_candidates(tfidf_top, "summarize_04b_tfidf_candidates")   # raw candidates (pre-exclusion)
    tfidf_top_pre_excl <- tfidf_top
    tfidf_top <- drop_excluded_terms(tfidf_top, label_exclusions)   # post-tf-idf, pre-ranking
    dump_excluded_terms(tfidf_top_pre_excl, tfidf_top, "summarize_04e_excluded_terms")
    vslog$debug(paste("create_cluster_labels: tf-idf matrix", nTerms(nn_tfidf), "terms x",
                      nDocs(nn_tfidf), "clusters"))

    # Rank-aware selection (ranking.R) over the global ranking, partitioned by
    # rank_sources. Initial labels come from the map-wide min2 (DF >= 2) corpus.
    tfidf_top_names <- select_cluster_label_names(tfidf_top, top_n, stops, mode = mode,
                                                  rank_sources = rank_sources)

    # min1 fallback: any cluster whose label came out EMPTY is re-labelled from the
    # min1 corpus (all title n-grams, bound 1). The trigger is "empty label", NOT
    # "zero tf-idf sum": with the DF filter a cluster can have a tiny tf-idf that prunes
    # away to nothing, which the old zero-sum check missed, dropping it straight to the
    # abstract-frequency fallback instead of the intended min1 rescue.
    # The title/abstract-frequency fallback below remains the true last resort.
    empty_label <- which(!vapply(tfidf_top_names,
                                 function(x) { s <- if (length(x)) x[[1]] else ""; nzchar(s) },
                                 logical(1)))
    if (length(empty_label) > 0) {
      vslog$debug(paste("create_cluster_labels: min1 fallback for", length(empty_label),
                        "clusters with an empty min2 label"))
      fallback_top   <- drop_excluded_terms(fill_empty_clusters(fallback_corpus), label_exclusions)
      dump_tfidf_candidates(fallback_top, "summarize_04f_min1_fallback_candidates")
      fallback_names <- select_cluster_label_names(fallback_top, top_n, stops, mode = mode,
                                                   rank_sources = rank_sources,
                                                   dbg_stage = "summarize_04c_min1_rank_candidates")
      tfidf_top_names[empty_label] <- fallback_names[empty_label]
      label_source[empty_label] <- "min1_fallback"
    }
  }
  dump_data(tfidf_top_names, "summarize_05_tfidf_top_names")
  clusters$cluster_labels = ""
  for (k in seq(1, clusters$num_clusters)) {
    matches = which(unname(clusters$groups == k) == TRUE)
    summary = tfidf_top_names[[k]]
    if (summary == "") {
      # No tf-idf label survived even the min1 fallback: last-resort label built
      # from the papers' titles + abstracts (see title_abstract_fallback_label).
      vslog$debug(paste("create_cluster_labels: title/abstract fallback for cluster", k,
                        "with", length(matches), "papers"))
      summary <- title_abstract_fallback_label(matches, metadata, stops, top_n, label_exclusions, cluster = k,
                                               ngram_lengths = nset_lengths)
      label_source[k] <- "title_abstract_fallback"
    }
    clusters$cluster_labels[c(matches)] = summary
  }
  if (!(is.null(cc)) && (cc %in% names(metadata$annotations))) {
    clusters$cluster_labels = metadata$annotations[[cc]]
  }
  clusters$cluster_labels <- fix_cluster_labels(clusters$cluster_labels, type_counts)
  dump_data(data.frame(cluster = clusters$groups, label = clusters$cluster_labels),
            "summarize_06_cluster_labels")
  # Per-cluster label provenance: which path built the label, plus the label as selected
  # by tf-idf/ranking (pre-fallback, pre-casing) vs the final label (post-casing). Lets a
  # single label be traced back to its source path and its transformation.
  dump_data(data.frame(
    cluster = seq_len(clusters$num_clusters),
    n_papers = vapply(seq_len(clusters$num_clusters),
                      function(k) sum(clusters$groups == k, na.rm = TRUE), integer(1)),
    source = label_source,
    label_selected = vapply(seq_len(clusters$num_clusters),
                            function(k) { s <- tfidf_top_names[[k]]
                                          if (length(s)) as.character(s[[1]]) else "" }, character(1)),
    label_final = vapply(seq_len(clusters$num_clusters),
                         function(k) { i <- which(clusters$groups == k)[1]
                                       if (is.na(i)) "" else clusters$cluster_labels[i] }, character(1)),
    stringsAsFactors = FALSE), "summarize_06b_label_provenance")
  vslog$debug(paste("create_cluster_labels: done,",
                    length(unique(clusters$cluster_labels)), "distinct labels"))
  return(clusters)
}



# Turn the ranked tf-idf terms of each cluster into a display label: prunes
# stopword-edged n-grams, removes n-grams nested inside others (keeping the more
# specific one), capitalises, and returns the top_n terms joined with ", ".
get_top_names <- function(tfidf_top, top_n, stops) {
  tfidf_top_names <- lapply(tfidf_top, names)
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {another_prune_ngrams(x, stops)})
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {x = gsub("_", " ", x); trim(x)})
  tfidf_top_names <- lapply(tfidf_top_names, function(x) filter_out_nested_ngrams(x, top_n))
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {paste0(toupper(substr(x, 1, 1)), substr(x, 2, nchar(x)))})
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {paste(unlist(trim(x)), collapse=", ")})
  return(tfidf_top_names)
}


# Variant of prune_ngrams used on tf-idf term names: drops n-grams that start or
# end with a stopword or whose first and last token are identical. Tolerant of
# empty/NA tokens. Returns the surviving "_"-joined n-grams.
another_prune_ngrams <- function(ngrams, stops){
  # filter out stopwords from start or stop of ngrams
  tokens <- unname(unlist(ngrams))
  # split ngrams
  tokens = lapply(tokens, strsplit, split="_")
  tokens = tokens[lapply(tokens, length)>0]
  # check if first token of ngrams in stopword list
  batch_size <- 1000
  total_length <- length(stops)
  
  for (i in seq(1, total_length, batch_size)) try({
      tokens = lapply(tokens, function(y){
          Filter(function(x){
              if (!is.na(x[1]) && x[1] != "") {
                  !any(stringi::stri_detect_fixed(stops[i:min(i+batch_size-1, total_length)], x[1]))
              } else {
                  FALSE
              }
          }, y)
      })
      # check if last token of ngrams in stopword list
      tokens = lapply(tokens, function(y){
          Filter(function(x){
              last_token <- tail(x, 1)
              if (!is.na(last_token) && last_token != "") {
                  !any(stringi::stri_detect_fixed(stops[i:min(i+batch_size-1, total_length)], last_token))
              } else {
                  FALSE
              }
          }, y)
      })
  })
  
  # check that first token is not the same as the last token
  tokens = lapply(tokens, function(y){
                    if(length(y) > 1) {
                          Filter(function(x){
                                      !(x[1]==tail(x,1))
                          }, y)}
                    else y})
  tokens = lapply(tokens, function(y){Filter(function(x){length(x)>=1},y)})
  keep = which(lapply(tokens, length)!=0)
  tokens = tokens[keep]
  tokens = lapply(tokens, function(x){mapply(paste, x, collapse="_")})
  return(tokens)
}
