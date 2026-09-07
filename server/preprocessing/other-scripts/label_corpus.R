# label_corpus.R
# Per-cluster corpus assembly for labelling: the heuristic keyword columns
# (HEUR_MIN1/MIN2), the G1 bypass, and the three corpus builders (ranked,
# legacy Mode 0, custom clustering) with their empty-cluster fills.
# Sourced by summarize.R.


# Metadata columns holding the heuristically generated (title n-gram) keywords,
# pre-binned by MAP-WIDE document frequency (see add_heuristic_keyword_fields):
#   _min1 = n-grams appearing in >= 1 resource (all)   -> used for the FALLBACK corpus
#   _min2 = n-grams appearing in >= 2 resources         -> used for the INITIAL corpus
# The DF filter is GLOBAL (map-wide), applied to Modes 1-3 only; Mode 0 is legacy.
HEUR_MIN1 <- "keywords_rank_heuristically_generated_min1"
HEUR_MIN2 <- "keywords_rank_heuristically_generated_min2"


# MeSH rank columns, produced upstream by the data client (base.R, BASE only for
# now). Used by Modes 2/3 to split subject tokens into specific/generic. When
# absent (integrations without MeSH), the split is empty and Mode 2/3 degrade to
# Mode-1-like behaviour (see get_cluster_corpus).
KW_MESH_SPECIFIC <- "keywords_rank_mesh_specific"
KW_MESH_GENERIC  <- "keywords_rank_mesh_generic"


# Tokenizer used by the TermDocumentMatrix: splits a document into terms on ";".
# The corpus joins tokens (words and "_"-joined n-grams) with ";", so this
# recovers them as individual terms without re-splitting the n-grams.
SplitTokenizer <- function(x) {
  tokens = unlist(lapply(strsplit(words(x), split=";"), paste), use.names = FALSE)
  return(tokens)
}


# bypass for the generator settings (>= 1): papers whose `subject` was
# synthesised from the title (subject_is_heuristic) get it blanked, so the
# synthesis reaches neither the corpus nor any rank source — those papers
# contribute exclusively through the generator columns. Setting 0 must NOT
# apply this: the synthesis is part of the replicated baseline.
bypass_heuristic_subjects <- function(metadata) {
  if (!is.null(metadata$subject_is_heuristic)) {
    metadata$subject[as.logical(metadata$subject_is_heuristic)] <- ""
  }
  metadata
}


# Add the two heuristic-keyword metadata columns (HEUR_MIN1 / HEUR_MIN2) to the
# metadata data frame. Generates each paper's n-grams through the shared
# generator (ngram_candidates, de-duplicated per paper), computes each n-gram's
# MAP-WIDE document frequency (number of distinct resources it appears in), and stores
# per paper, as "; "-joined "_"-n-gram strings:
#   HEUR_MIN1 = all of the paper's n-grams (DF >= 1)
#   HEUR_MIN2 = the paper's n-grams with map-wide document frequency >= 2
# Computed once, early in labelling. ngram_lengths comes from the resolved
# n-gram setting (ngram_setting_lengths); the Setting-0 default c(2, 3)
# reproduces paper_title_ngrams exactly (pinned by the drop-in equivalence
# test in test_ngram_generator.R). The generator input is the title — or
# title + abstract for no-keyword (subject_is_heuristic) papers when the
# abstract flag is on: the input is assembled per paper by the data, not a
# code branch.
add_heuristic_keyword_fields <- function(metadata, stops, ngram_lengths = c(2, 3),
                                         include_abstracts = FALSE) {
  input_text <- metadata$title
  if (include_abstracts && !is.null(metadata$subject_is_heuristic) &&
      !is.null(metadata$paper_abstract)) {
    fl <- which(as.logical(metadata$subject_is_heuristic))
    input_text[fl] <- paste(metadata$title[fl], metadata$paper_abstract[fl])
  }
  per_paper <- lapply(input_text, function(t)
    unique(ngram_candidates(t, stops, ngram_lengths = ngram_lengths)))
  df <- table(unlist(lapply(per_paper, unique)))          # map-wide document frequency
  min2_set <- names(df)[df >= 2]
  metadata[[HEUR_MIN1]] <- vapply(per_paper,
    function(g) paste(g, collapse = "; "), character(1))
  metadata[[HEUR_MIN2]] <- vapply(per_paper,
    function(g) paste(g[g %in% min2_set], collapse = "; "), character(1))
  metadata
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


# --- Mode 0 (legacy) corpus + fallback -------------------------------------
# Mode 0 keeps the legacy corpus/selection STRUCTURE: title n-grams are
# generated INLINE rather than read from the DF-filtered min1/min2 columns, and
# there are no rank_sources. Generation always goes through the shared
# generator (ngram_candidates); at Setting 0 (legacy_quirks = TRUE) the
# legacy_prune_quirks post-filter reproduces the historical prune behaviour on
# top of it, keeping Setting 0 byte-equivalent to the baseline. Settings >= 1
# pass their own lengths with the quirks off.
get_cluster_corpus_legacy <- function(clusters, metadata, stops, taxonomy_separator,
                               add_title_ngrams = T, custom_clustering=NULL,
                               ngram_lengths = c(2, 3), legacy_quirks = TRUE) {
  subjectlist = list()
  for (k in seq(1, clusters$num_clusters)) {
    matches = which(unname(clusters$groups == k) == TRUE)
    titles =  metadata$title[matches]
    subjects = metadata$subject[matches]
    # segment each title at punctuation boundaries so the inline n-grams cannot
    # span a boundary and tight compounds stay whole; the unigram word stream
    # is built from the same segment tokens
    title_segments = lapply(titles, punctuation_segments)
    # per-title n-grams from the shared generator (raw stream, no dedup —
    # mode-0 tf counts duplicates). One vector per length keeps the legacy tf
    # property that subjects recycle over the length groups in the later
    # paste(subjects, title_ngrams).
    group_join <- function(n) {
      per_title <- lapply(titles, function(t)
        ngram_candidates(t, stops, ngram_lengths = n))
      if (legacy_quirks) per_title <- legacy_prune_quirks(per_title, stops)
      vapply(per_title, paste, character(1), collapse = ";", USE.NAMES = FALSE)
    }
    title_ngrams <- unlist(lapply(ngram_lengths, group_join))
    titles = lapply(title_segments, paste, collapse = " ")
    batch_size <- 1000
    total_length <- length(stops)
    for (i in seq(1, total_length, batch_size)) {
      titles = lapply(titles, function(x) {removeWords(x, stops[i:min(i+batch_size -1, total_length)])})
    }
    subjects = mapply(gsub, subjects, pattern = "; ", replacement=";")
    subjects = mapply(gsub, subjects, pattern=" ", replacement="_")
    titles = mapply(gsub, titles, pattern=" ", replacement=";")

    if (!is.null(taxonomy_separator)) {
      subjects = mapply(function(x){strsplit(x, ";")}, subjects)
      taxons = lapply(subjects, function(y){Filter(function(x){grepl(taxonomy_separator, x)}, y)})
      subjects = lapply(subjects, function(y){Filter(function(x){!grepl(taxonomy_separator, x)}, y)})
      taxons = lapply(taxons, function(x){lapply(strsplit(x, taxonomy_separator), function(y){tail(y,1)})})
      taxons = lapply(taxons, function(x){paste(unlist(x), collapse=";")})
      subjects = lapply(subjects, function(x){paste(unlist(x), collapse=";")})
      subjects = mapply(paste, subjects, taxons, collapse=";")
    }
    if (add_title_ngrams == T) {
      all_subjects = paste(subjects, title_ngrams, collapse=" ")
    } else {
      all_subjects = paste(subjects, collapse=" ")
    }
    all_subjects <- str_replace_all(all_subjects, "\\?+_\\?+|\\?+|\\?+ ", "")
    all_subjects <- str_replace_all(all_subjects, ";+", ";")
    all_subjects <- str_replace_all(all_subjects, " ?; ?", ";")
    all_subjects <- str_replace_all(all_subjects, " +", ";")
    subjectlist = c(subjectlist, all_subjects)
  }
  nn_corpus <- VCorpus(VectorSource(subjectlist))
  return(nn_corpus)
}


# Legacy (Mode 0) fallback: rebuild the tf-idf of the SAME corpus with local bound
# c(1, Inf) for clusters whose initial tf-idf summed to zero. Verbatim legacy
# 2-arg signature — distinct from the Modes 1-3 fill_empty_clusters (min1 corpus).
fill_empty_clusters_legacy <- function(nn_tfidf, nn_corpus){
  replacement_nn_tfidf <- TermDocumentMatrix(nn_corpus, control = list(tokenize = SplitTokenizer,
                                                          weighting = function(x) weightSMART(x, spec="ntn"),
                                                          bounds = list(local = c(1, Inf))
                                                           ))
  replacement_tfidf_top <- apply(replacement_nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>0]})
  return(replacement_tfidf_top)
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
  replaced_subject_dbg = list()  # subjects synthesised from titles (rank 2, not rank 1)
  mesh_spec_dbg = list(); mesh_gen_dbg = list()  # normalised MeSH tokens (empty if no mesh columns)
  has_mesh <- !is.null(metadata[[KW_MESH_SPECIFIC]])
  for (k in seq(1, clusters$num_clusters)) {
    matches = which(unname(clusters$groups == k) == TRUE)
    subjects = metadata$subject[matches]
    # subject_is_heuristic flags papers whose `subject` was synthesised from the
    # title by replace_keywords_if_empty (they had no real keywords). Their tokens
    # are routed to the HEURISTIC rank source (rank 2), not the cleaned/keyword
    # source (rank 1). Absent on fixtures captured before this change -> all FALSE.
    flagged = if (!is.null(metadata$subject_is_heuristic)) {
      as.logical(metadata$subject_is_heuristic[matches])
    } else {
      rep(FALSE, length(matches))
    }
    # Heuristic keywords are pre-generated "_"-joined n-grams (see
    # add_heuristic_keyword_fields): the corpus uses heuristic_col (map-wide min2
    # initial / min1 fallback); the rank map always uses min1 (the superset), so any
    # heuristic term resolves to rank 2 regardless of which pass produced it.
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
    # Corpus is unchanged: it uses ALL subjects + heuristics (flagged or not), so
    # tf-idf weights are identical. Only the RANK MAP splits them — flagged papers'
    # subject tokens go to the heuristic rank source below, not the cleaned one.
    subject_dbg[[k]]          = paste(unlist(subjects[!flagged]), collapse=";")   # rank 1 (real keywords)
    replaced_subject_dbg[[k]] = paste(unlist(subjects[flagged]),  collapse=";")   # rank 2 (title-synthesised)
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
  # heuristic = the min1 title n-grams PLUS the flagged papers' synthesised subject
  # tokens (title-derived, so they belong in rank 2 — see the subject_is_heuristic
  # routing above). Both are already in the corpus, so no double-counting.
  heuristic_tok <- mapply(function(h, r) unique(c(split_tokens(h), split_tokens(r))),
                          heuristic_min1_dbg, replaced_subject_dbg, SIMPLIFY = FALSE)
  rank_sources <- list(cleaned         = subj_tok,
                       cleaned_ex_mesh = cleaned_ex_mesh,
                       mesh_specific   = mesh_specific,
                       mesh_generic    = mesh_generic,
                       heuristic       = heuristic_tok)
  nn_corpus <- VCorpus(VectorSource(subjectlist))
  return(list(corpus = nn_corpus, rank_sources = rank_sources))
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
