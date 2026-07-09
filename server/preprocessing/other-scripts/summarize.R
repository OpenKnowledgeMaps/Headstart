library(stringr)
vslog <- getLogger('vis.summarize')

# Metadata columns holding the heuristically generated (title n-gram) keywords,
# pre-binned by map-wide document frequency (see add_heuristic_keyword_fields:
#   _min1 = n-grams appearing in >= 1 resource (all)   -> used for the FALLBACK corpus
#   _min2 = n-grams appearing in >= 2 resources         -> used for the INITIAL corpus
HEUR_MIN1 <- "keywords_rank_heuristically_generated_min1"
HEUR_MIN2 <- "keywords_rank_heuristically_generated_min2"

# MeSH rank columns, produced upstream by the data client (base.R, BASE only for
# now). Used by Modes 2/3 to split subject tokens into specific/generic. When
# absent (integrations without MeSH), the split is empty and Mode 2/3 degrade to
# Mode-1-like behaviour (see get_cluster_corpus).
KW_MESH_SPECIFIC <- "keywords_rank_mesh_specific"
KW_MESH_GENERIC  <- "keywords_rank_mesh_generic"

# summarize.R
# Cluster labelling for the overview visualisation: turns each cluster of papers
# into a short, human-readable area title. create_cluster_labels() is the entry
# point (called from vis_layout.R); the helpers build a per-cluster text corpus,
# rank candidate terms by tf-idf, prune and de-nest n-grams, and fix casing.
# Tokens are kept ";"-separated throughout because SplitTokenizer (the
# TermDocumentMatrix tokenizer) splits terms on ";".

# Tokenizer used by the TermDocumentMatrix: splits a document into terms on ";".
# The corpus joins tokens (words and "_"-joined n-grams) with ";", so this
# recovers them as individual terms without re-splitting the n-grams.
SplitTokenizer <- function(x) {
  tokens = unlist(lapply(strsplit(words(x), split=";"), paste), use.names = FALSE)
  return(tokens)
}

# Strip leading and trailing whitespace from a string.
trim <- function (x) gsub("^\\s+|\\s+$", "", x)


# Normalise a combined token string to the ";"-separated form the SplitTokenizer
# consumes: drop "?" artifacts, collapse repeated ";", trim spaces around ";", and
# turn any remaining whitespace into ";". This is the SINGLE source of truth for
# corpus tokenization, used both to build the corpus document and to derive the
# per-cluster rank sources — so a rank token can never drift out of the tf-idf term
# set (see get_cluster_corpus / ranking.R).
normalize_corpus_tokens <- function(s) {
  s <- str_replace_all(s, "\\?+_\\?+|\\?+|\\?+ ", "")
  s <- str_replace_all(s, ";+", ";")
  s <- str_replace_all(s, " ?; ?", ";")
  s <- str_replace_all(s, " +", ";")
  s
}


# Generate all contiguous n-grams of length n from each input string. The words
# within an n-gram are joined with "_" so a whitespace tokenizer keeps the n-gram
# intact. Returns, per input string, a single space-separated string of its n-grams.
expand_ngrams <- function(text, n) {
  text <- trimws(text)
  lapply(lapply(text, function(x)unlist(lapply(ngrams(unlist(strsplit(x, split = " ")), n), paste, collapse  = "_"))), paste, collapse = " ")
}

# Drop low-value n-grams from a set of "_"-joined n-grams. Removes n-grams that
# start or end with a stopword, whose first and last token are identical, or that
# are shorter than 2 tokens; stopwords are checked in batches for speed. Returns,
# per input, the surviving n-grams joined with ";".
prune_ngrams <- function(ngrams, stops){
  ngrams = mapply(strsplit, ngrams, split=" |;")
  tokenized_ngrams = mapply(function(x) {
                            strsplit(x, split="_")
                          }, ngrams)
  # filter out empty tokens
  tokenized_ngrams = lapply(tokenized_ngrams, function(ngrams){ngrams[lapply(ngrams, length)>0]})
  # remove ngrams starting with a stopword
  batch_size <- 1000
  total_length <- length(stops)
  for (i in seq(1, total_length, batch_size)) {
    tokenized_ngrams = lapply(tokenized_ngrams, function(x) {
                              Filter(function(tokens){
                                !any(stringi::stri_detect_fixed(stops[i:min(i+batch_size -1, total_length)], tolower(tokens[[1]])))
                              }, x)})
    # remove ngrams ending with a stopword
    tokenized_ngrams = lapply(tokenized_ngrams, function(x) {
                              Filter(function(tokens){
                                !any(stringi::stri_detect_fixed(stops[i:min(i+batch_size -1, total_length)], tolower(tail(tokens,1))))
                              }, x)})
  }
  # remove ngrams starting and ending with the same word
  tokenized_ngrams = lapply(tokenized_ngrams, function(x) {
                            Filter(function(tokens){
                              !(tokens[[1]]==tail(tokens,1))
                            }, x)})
  # keep ngrams with min length 2
  tokenized_ngrams = lapply(tokenized_ngrams, function(x){x[lapply(x, length)>1]})
  tokenized_ngrams = tokenized_ngrams[lapply(tokenized_ngrams, length)>1]
  tokenized_ngrams = lapply(tokenized_ngrams, function(x){mapply(paste, x, collapse="_")})
  pruned_ngrams = lapply(tokenized_ngrams, paste, collapse=";")
  return (pruned_ngrams)
}

# Heuristically generated keywords for a single paper: the bi- and tri-grams of
# its title, pruned of degenerate forms (n-grams that start or end with a
# stopword, or whose first and last token are identical). Words within an n-gram
# are "_"-joined so the tokenizer keeps them intact. Returns a character vector of
# unique "_"-joined n-grams (possibly empty).
paper_title_ngrams <- function(title, stops) {
  clean <- gsub("[^[:alnum:]-]", " ", if (is.na(title)) "" else title)
  clean <- trimws(gsub("\\s+", " ", clean))
  if (!nzchar(clean)) return(character(0))
  grams <- unlist(c(expand_ngrams(clean, 2), expand_ngrams(clean, 3)))
  grams <- unlist(strsplit(paste(grams, collapse = " "), " "))
  grams <- grams[nzchar(grams)]
  if (!length(grams)) return(character(0))
  keep <- vapply(grams, function(g) {
    toks <- strsplit(g, "_", fixed = TRUE)[[1]]
    length(toks) >= 2 &&
      !(tolower(toks[1]) %in% stops) &&
      !(tolower(toks[length(toks)]) %in% stops) &&
      toks[1] != toks[length(toks)]
  }, logical(1), USE.NAMES = FALSE)
  unique(grams[keep])
}

# Add the two heuristic-keyword metadata columns (HEUR_MIN1 / HEUR_MIN2) to the
# metadata data frame. Generates each paper's title n-grams, computes each
# n-gram's MAP-WIDE document frequency (number of distinct resources it appears
# in), and stores per paper, as "; "-joined "_"-n-gram strings:
#   HEUR_MIN1 = all of the paper's n-grams (DF >= 1)
#   HEUR_MIN2 = the paper's n-grams with document frequency >= 2
# Computed once, early in labelling.
add_heuristic_keyword_fields <- function(metadata, stops) {
  per_paper <- lapply(metadata$title, paper_title_ngrams, stops = stops)
  df <- table(unlist(lapply(per_paper, unique)))          # map-wide document frequency
  min2_set <- names(df)[df >= 2]
  metadata[[HEUR_MIN1]] <- vapply(per_paper,
    function(g) paste(g, collapse = "; "), character(1))
  metadata[[HEUR_MIN2]] <- vapply(per_paper,
    function(g) paste(g[g %in% min2_set], collapse = "; "), character(1))
  metadata
}

# Last-resort label for a cluster that produced no tf-idf label (empty even after
# the min1 fallback): build one from the most frequent bi-/tri-grams of the
# cluster's papers' titles + abstracts. Returns a single ", "-joined label string.
#   matches  : row indices of the cluster's papers in `metadata`.
#   top_n    : number of terms kept.
title_abstract_fallback_label <- function(matches, metadata, stops, top_n = 3) {
  batch_size <- 1000
  total_length <- length(stops)
  candidates = mapply(paste, metadata$title[matches], metadata$paper_abstract[matches])
  candidates = lapply(candidates, tolower)
  for (i in seq(1, total_length, batch_size)) {
    candidates = lapply(candidates, function(x) {paste(removeWords(x, stops[i:min(i+batch_size -1, total_length)]), collapse="")})
  }
  candidates = lapply(candidates, function(x) {gsub("[^[:alpha:]]", " ", x)})
  candidates = lapply(candidates, function(x) {gsub(" +", " ", x)})
  candidates_bigrams = lapply(lapply(candidates, expand_ngrams, n=2), paste, collapse=" ")
  candidates_trigrams = lapply(lapply(candidates, expand_ngrams, n=3), paste, collapse=" ")
  candidates = unname(mapply(paste, candidates_bigrams, candidates_trigrams))
  candidates =  unlist(lapply(candidates, str_split, " "), recursive = F)
  candidates = unlist(lapply(candidates, function(x) {another_prune_ngrams(x, stops)}))
  top_ngrams = sort(table(strsplit(paste(candidates, collapse=" "), " ")), decreasing = T)
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
  # Additive rank columns on the metadata data frame:
  #  - keywords_rank_cleaned: the rank-1 source. Stage 1 = subject_cleaned verbatim
  #    (keywords + MeSH pooled); Stage 2 carves MeSH out into an upstream mesh column.
  #  - the two heuristic columns (min1/min2), pre-binned by map-wide document
  #    frequency. subject_cleaned (metadata$subject) is left untouched.
  metadata <- add_heuristic_keyword_fields(metadata, stops)
  metadata$keywords_rank_cleaned <- metadata$subject
  cc <- params$custom_clustering
  if (!(is.null(cc)) && (cc %in% names(metadata))) {
    corpus_out <- get_custom_cluster_corpus(clusters, metadata, stops, taxonomy_separator, custom_clustering=cc)
    fallback_corpus <- corpus_out$corpus   # custom path: no heuristic min1/min2 split
  } else {
    # Initial corpus uses the min2 heuristic set (DF >= 2); the fallback corpus
    # swaps in min1 (all n-grams).
    corpus_out <- get_cluster_corpus(clusters, metadata, stops, taxonomy_separator, heuristic_col = HEUR_MIN2)
    fallback_corpus <- get_cluster_corpus(clusters, metadata, stops, taxonomy_separator, heuristic_col = HEUR_MIN1)$corpus
  }
  # get_*_cluster_corpus returns the corpus plus per-cluster rank sources (the
  # separated keyword/heuristic tokens used only for rank lookup). rank_sources
  # is NULL on the custom-clustering path, so ranked modes fall back to legacy there.
  nn_corpus <- corpus_out$corpus
  rank_sources <- corpus_out$rank_sources
  dump_data(nn_corpus, "summarize_04_corpus")
  # Resolve the ranking mode BEFORE the TDM: the local frequency bound is
  # mode-dependent c(2, Inf) for Mode 0 (byte-identical legacy), c(1, Inf)
  # for Modes 1-3 so low-frequency real keywords survive into the ranking. The
  # corpus text and weighting are otherwise identical across modes.
  mode <- ranking_mode(service)
  local_bound <- if (identical(mode, "0")) c(2, Inf) else c(1, Inf)
  vslog$debug(paste("create_cluster_labels: ranking mode", mode, "for service",
                    if (is.null(service)) "(none)" else service,
                    "; local bound", local_bound[1]))
  nn_tfidf <- TermDocumentMatrix(nn_corpus, control = list(
    tokenize = SplitTokenizer,
    weighting = function(x) weightSMART(x, spec="ntn"),
    bounds = list(local = local_bound),
    tolower = TRUE
  ))
  tfidf_top <- apply(nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>0]})
  vslog$debug(paste("create_cluster_labels: tf-idf matrix", nTerms(nn_tfidf), "terms x",
                    nDocs(nn_tfidf), "clusters"))

  # Ranking-mode wedge (ranking.R): Mode 0 is the unchanged legacy selection;
  # Modes 1-3 apply rank-aware selection over the same global ranking, partitioned
  # by rank_sources. Initial labels come from the min2 (DF >= 2) corpus.
  tfidf_top_names <- select_cluster_label_names(tfidf_top, top_n, stops, mode = mode,
                                                rank_sources = rank_sources)

  # min1 fallback: any cluster whose label came out EMPTY is re-labelled from the
  # min1 corpus (all title n-grams, bound 1). The trigger is "empty label", NOT
  # "zero tf-idf sum": with the min2 DF filter a cluster can have a tiny tf-idf that
  # prunes away to nothing, which the old zero-sum check missed, dropping it
  # straight to the abstract-frequency fallback instead of the intended min1 rescue.
  # The title/abstract-frequency fallback below remains the true last resort.
  empty_label <- which(!vapply(tfidf_top_names,
                               function(x) { s <- if (length(x)) x[[1]] else ""; nzchar(s) },
                               logical(1)))
  if (length(empty_label) > 0) {
    vslog$debug(paste("create_cluster_labels: min1 fallback for", length(empty_label),
                      "clusters with an empty min2 label"))
    fallback_top   <- fill_empty_clusters(fallback_corpus)
    fallback_names <- select_cluster_label_names(fallback_top, top_n, stops, mode = mode,
                                                 rank_sources = rank_sources)
    tfidf_top_names[empty_label] <- fallback_names[empty_label]
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
      summary <- title_abstract_fallback_label(matches, metadata, stops, top_n)
    }
    clusters$cluster_labels[c(matches)] = summary
  }
  if (!(is.null(cc)) && (cc %in% names(metadata$annotations))) {
    clusters$cluster_labels = metadata$annotations[[cc]]
  }
  clusters$cluster_labels <- fix_cluster_labels(clusters$cluster_labels, type_counts)
  dump_data(data.frame(cluster = clusters$groups, label = clusters$cluster_labels),
            "summarize_06_cluster_labels")
  vslog$debug(paste("create_cluster_labels: done,",
                    length(unique(clusters$cluster_labels)), "distinct labels"))
  return(clusters)
}


# Normalise a vector of cluster labels: restore term casing (fix_keyword_casing)
# and collapse repeated commas. Returns the cleaned labels.
fix_cluster_labels <- function(clusterlabels, type_counts){
  unlist(mclapply(clusterlabels, function(x) {
    x <- fix_keyword_casing(x, type_counts)
    # clean up titles from format issues
    x <- gsub(",+", ",", x)
    }))
}

# Restore the casing of each word in a single label and capitalise the first
# letter of every comma-separated phrase. Words are matched back to their
# original corpus casing via match_keyword_case(type_counts).
fix_keyword_casing <- function(keyword, type_counts) {
  kw = strsplit(keyword, ", ")
  kw = lapply(kw, strsplit, " ")[[1]]
  kw = lapply(kw, function(x){lapply(x, match_keyword_case, type_counts=type_counts)})
  kw = lapply(kw, paste, collapse = " ")
  kw = lapply(kw, function(x) {paste0(toupper(substr(x, 1, 1)), substr(x, 2, nchar(x)))})
  kw = paste(kw, collapse = ", ")
  return(paste(kw, collapse = ", "))
}

# Return the canonical (original-corpus) casing of a token: looks it up in
# type_counts case-insensitively, ignoring hyphens. Falls back to the input
# token if there is no match.
match_keyword_case <- function(x, type_counts) {
  y <- names(type_counts[which(tolower(names(type_counts)) == gsub("-", "", tolower(x)))][1])
  if (!is.na(y)) return(y) else return(x)
}

# Build the per-cluster corpus from a custom metadata field (custom_clustering)
# instead of subjects. Per cluster: removes stopwords, then joins and normalises
# the field values into a single ";"-separated token string. Returns
# list(corpus, rank_sources) with rank_sources = NULL (no provenance split on this
# path, so ranked modes fall back to legacy selection).
get_custom_cluster_corpus <- function(clusters, metadata, stops, taxonomy_separator,
                               add_title_ngrams = T, custom_clustering=NULL) {
  subjectlist = list()
  for (k in seq(1, clusters$num_clusters)) {
    matches = which(unname(clusters$groups == k) == TRUE)
    custom_input = metadata[[custom_clustering]][matches]
    batch_size <- 1000
    total_length <- length(stops)
    for (i in seq(1, total_length, batch_size)) {
      custom_input = lapply(custom_input, function(x) {removeWords(x, stops[i:min(i+batch_size -1, total_length)])})
    }
    custom_input = mapply(gsub, custom_input, pattern = "; ", replacement=";")
    custom_input = mapply(gsub, custom_input, pattern=" ", replacement="_")

    all_subjects = paste(custom_input, collapse=" ")
    all_subjects <- normalize_corpus_tokens(all_subjects)
    subjectlist = c(subjectlist, all_subjects)
  }
  # Custom clustering has no keyword/heuristic provenance split, so rank_sources is
  # NULL: ranked modes fall back to the legacy selection on this path (ranking.R).
  nn_corpus <- VCorpus(VectorSource(subjectlist))
  return(list(corpus = nn_corpus, rank_sources = NULL))
}

# Build the per-cluster corpus used for tf-idf labelling. Per cluster: combines
# the papers' `subject` keywords with bi-/tri-grams from their titles. Taxonomy
# subjects (containing taxonomy_separator) are reduced to their last path segment.
# Everything is normalised into one ";"-separated token string per cluster.
# Returns list(corpus, rank_sources): a VCorpus with one document per cluster, and
# per-cluster rank sources (cleaned = subject tokens, heuristic = title n-grams,
# lowercased) used by the ranked selection. add_title_ngrams toggles the title
# n-gram contribution.
get_cluster_corpus <- function(clusters, metadata, stops, taxonomy_separator,
                               heuristic_col = HEUR_MIN2) {
  subjectlist = list()
  subject_dbg = list(); heuristic_dbg = list(); heuristic_min1_dbg = list()
  mesh_spec_dbg = list(); mesh_gen_dbg = list()  # normalised MeSH tokens (empty if no mesh columns)
  has_mesh <- !is.null(metadata[[KW_MESH_SPECIFIC]])
  for (k in seq(1, clusters$num_clusters)) {
    matches = which(unname(clusters$groups == k) == TRUE)
    subjects = metadata$subject[matches]
    # Heuristic keywords are pre-generated "_"-joined n-grams (see
    # add_heuristic_keyword_fields): the corpus uses heuristic_col (min2 initial /
    # min1 fallback); the rank map always uses min1 (the superset), so any heuristic
    # term resolves to rank 2 regardless of which pass produced it.
    heuristics = as.character(metadata[[heuristic_col]][matches])
    heuristics_min1 = as.character(metadata[[HEUR_MIN1]][matches])

    subjects = mapply(gsub, subjects, pattern = "; ", replacement=";")
    subjects = mapply(gsub, subjects, pattern=" ", replacement="_")
    heuristics = gsub("; ", ";", heuristics)
    heuristics_min1 = gsub("; ", ";", heuristics_min1)

    if (!is.null(taxonomy_separator)) {
      subjects = mapply(function(x){strsplit(x, ";")}, subjects)
      taxons = lapply(subjects, function(y){Filter(function(x){grepl(taxonomy_separator, x)}, y)})
      subjects = lapply(subjects, function(y){Filter(function(x){!grepl(taxonomy_separator, x)}, y)})
      taxons = lapply(taxons, function(x){lapply(strsplit(x, taxonomy_separator), function(y){tail(y,1)})})
      taxons = lapply(taxons, function(x){paste(unlist(x), collapse=";")})
      subjects = lapply(subjects, function(x){paste(unlist(x), collapse=";")})
      subjects = mapply(paste, subjects, taxons, collapse=";")
    }
    subject_dbg[[k]] = paste(unlist(subjects), collapse=";")
    heuristic_dbg[[k]] = paste(unlist(heuristics), collapse=";")
    heuristic_min1_dbg[[k]] = paste(unlist(heuristics_min1), collapse=";")
    # MeSH columns (Modes 2/3): aggregate per cluster, normalised the same way as
    # subjects so their tokens match the subject tokens they classify. Empty when
    # the client did not populate them (-> Mode 2/3 degrade to Mode-1 behaviour).
    if (has_mesh) {
      msp = gsub(" ", "_", gsub("; ", ";", as.character(metadata[[KW_MESH_SPECIFIC]][matches])))
      mge = gsub(" ", "_", gsub("; ", ";", as.character(metadata[[KW_MESH_GENERIC]][matches])))
      mesh_spec_dbg[[k]] = paste(unlist(msp), collapse=";")
      mesh_gen_dbg[[k]]  = paste(unlist(mge), collapse=";")
    } else {
      mesh_spec_dbg[[k]] = ""; mesh_gen_dbg[[k]] = ""
    }
    all_subjects = paste(subjects, heuristics, collapse=" ")
    all_subjects <- normalize_corpus_tokens(all_subjects)
    subjectlist = c(subjectlist, all_subjects)
  }
  # Debug: record, per cluster, the tokens contributed by subjects vs. by the
  # heuristic (title n-gram) column, so a label term can be attributed to its source.
  dump_data(data.frame(cluster = seq_along(subjectlist),
                       subject_tokens = unlist(subject_dbg),
                       title_ngrams = unlist(heuristic_dbg)),
            "summarize_04a_corpus_sources")
  # Rank sources for the ranked selection (ranking.R): per-cluster token-sets, all
  # run through the SAME normalize_corpus_tokens() + lowercasing + edge-strip as the
  # TDM terms — so every rank token matches a tf-idf term. The MeSH split is
  # derived by MEMBERSHIP on the (already-normalised) subject tokens: a subject token
  # is mesh_specific/generic if it is in the corresponding MeSH column, else it is a
  # cleaned (ex-mesh) keyword. This keeps every rank token a genuine subject token
  # (so it matches the TDM) and needs no separate normalization path.
  #   cleaned         = all subject tokens (keywords + MeSH pooled) — Mode 1 rank 1.
  #   mesh_specific/generic = subject tokens classified as specific/generic MeSH.
  #   cleaned_ex_mesh = subject tokens minus MeSH — Modes 2/3 rank 1.
  #   heuristic       = the min1 title-n-gram tokens.
  # Used only for rank lookup, never fed to the TDM.
  split_tokens <- function(s) {
    t <- tolower(unlist(strsplit(normalize_corpus_tokens(s), ";")))
    t <- gsub("^_+|_+$", "", t)   # mirror the TDM tokenizer's edge-punctuation strip
    t[nzchar(t)]
  }
  subj_tok <- lapply(subject_dbg, split_tokens)
  spec_tok <- lapply(mesh_spec_dbg, split_tokens)
  gen_tok  <- lapply(mesh_gen_dbg,  split_tokens)
  mesh_specific <- mapply(intersect, subj_tok, spec_tok, SIMPLIFY = FALSE)
  mesh_generic  <- mapply(intersect, subj_tok, gen_tok,  SIMPLIFY = FALSE)
  cleaned_ex_mesh <- mapply(function(all, sp, ge) setdiff(all, c(sp, ge)),
                            subj_tok, mesh_specific, mesh_generic, SIMPLIFY = FALSE)
  rank_sources <- list(cleaned         = subj_tok,
                       cleaned_ex_mesh = cleaned_ex_mesh,
                       mesh_specific   = mesh_specific,
                       mesh_generic    = mesh_generic,
                       heuristic       = lapply(heuristic_min1_dbg, split_tokens))
  nn_corpus <- VCorpus(VectorSource(subjectlist))
  return(list(corpus = nn_corpus, rank_sources = rank_sources))
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

# Provide fallback top terms for clusters that produced none under the strict
# tf-idf bound, by recomputing the TermDocumentMatrix with a looser local bound
# (terms appearing at least once, instead of at least twice). Returns the
# per-cluster sorted term lists.
fill_empty_clusters <- function(fallback_corpus){
  replacement_nn_tfidf <- TermDocumentMatrix(fallback_corpus, control = list(tokenize = SplitTokenizer,
                                                          weighting = function(x) weightSMART(x, spec="ntn"),
                                                          bounds = list(local = c(1, Inf)),
                                                          tolower = TRUE
                                                           ))
  replacement_tfidf_top <- apply(replacement_nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>0]})
  return(replacement_tfidf_top)
}


# Extract pruned bi- and tri-grams from a set of titles (see prune_ngrams) and
# return them concatenated. Note: ngram_lengths is currently unused — lengths 2
# and 3 are hardcoded.
get_title_ngrams <- function(titles, stops, ngram_lengths) {
  # for ngrams: we have to collapse with "_" or else tokenizers will split ngrams again at that point and we'll be left with unigrams
  titles_bigrams = prune_ngrams(expand_ngrams(titles, 2), stops)
  titles_trigrams = prune_ngrams(expand_ngrams(titles, 3), stops)
  return(c(titles_bigrams, titles_trigrams))
}


# De-duplicate overlapping n-grams, preferring the more specific phrase: if a
# candidate is a substring of an already-kept name it is skipped; if a kept name
# is a substring of the candidate it is replaced by the candidate; otherwise the
# candidate is added. Returns up to top_n unique names.
filter_out_nested_ngrams <- function(top_ngrams, top_n) {
  top_names <- list()
  for (ngram in top_ngrams) {
    if (ngram == "")
      next;

    ngram_in_top_names = stringi::stri_detect_fixed(top_names, ngram)
    top_names_with_ngram = sapply(top_names, function(x)(stringi::stri_detect_fixed(ngram, x)))

    # ngram substring of any top_name, and no top_name substring of ngram -> skip ngram
    if (any(ngram_in_top_names == TRUE) && all(top_names_with_ngram == FALSE)) {}
    # ngram not substring of any top_name, but at least one top_name is a substring of ngram -> replace top_name with ngram
    else if (all(ngram_in_top_names == FALSE) && any(top_names_with_ngram == TRUE)) {
      top_names[which(top_names_with_ngram)] <- ngram
    }
    # a not substring of b, b not substring of a -> add b, next
    else if (all(ngram_in_top_names == FALSE) && all(top_names_with_ngram == FALSE)) {
      top_names <- unlist(c(top_names, ngram))
    }
  }
  return(head(unique(top_names), top_n))
}

