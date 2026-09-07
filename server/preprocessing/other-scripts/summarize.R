library(stringr)
vslog <- getLogger('vis.summarize')

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

# Remove a leading or trailing MeSH major-topic "*" from each "; "-separated
# keyword (sources place the marker on either side). Only a keyword-edge
# asterisk is a marker; an interior one ("2*2 design") is real content and
# stays.
strip_major_topic_markers <- function(x) {
  x <- gsub("(^|;\\s*)\\*+", "\\1", x)
  gsub("\\*+(\\s*;|$)", "\\1", x)
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
  # lapply/SIMPLIFY = FALSE: with mapply's default simplification, equal
  # n-gram counts across all inputs collapse the result into a matrix and
  # every n-gram is silently lost
  ngrams = lapply(ngrams, function(x) strsplit(x[[1]], split = " |;")[[1]])
  tokenized_ngrams = mapply(function(x) {
                            strsplit(x, split="_")
                          }, ngrams, SIMPLIFY = FALSE)
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
# its title's punctuation-delimited segments (punctuation_segments), pruned of
# degenerate forms (n-grams that start or end with a stopword, or whose first
# and last token are identical). Words within an n-gram are "_"-joined so the
# tokenizer keeps them intact. Returns a character vector of unique "_"-joined
# n-grams (possibly empty).
paper_title_ngrams <- function(title, stops) {
  segments <- punctuation_segments(title)
  if (!length(segments)) return(character(0))
  grams <- unlist(c(expand_ngrams(segments, 2), expand_ngrams(segments, 3)))
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

# Decode HTML character entities so they cannot fragment into bare digits or
# stray tokens downstream (removePunctuation turns "&#8211;" into "8211" fused
# into the surrounding word). Handles numeric decimal and hex forms and the
# common named entities; "&amp;" is decoded last so a double-encoded entity is
# only unwrapped one level. Decoded en-dash/hyphen codepoints are normalised to
# "-" so they do not multiply spelling variants of hyphenated terms.
decode_html_entities <- function(x) {
  decode_one <- function(s) {
    if (is.na(s) || !grepl("&", s, fixed = TRUE)) return(s)
    m <- gregexpr("&#[0-9]{1,7};", s)
    regmatches(s, m) <- lapply(regmatches(s, m), function(v) {
      if (!length(v)) return(v)
      vapply(v, function(e) intToUtf8(as.integer(sub("&#([0-9]+);", "\\1", e))),
             character(1), USE.NAMES = FALSE)
    })
    m <- gregexpr("&#[xX][0-9a-fA-F]{1,6};", s)
    regmatches(s, m) <- lapply(regmatches(s, m), function(v) {
      if (!length(v)) return(v)
      vapply(v, function(e) intToUtf8(strtoi(sub("&#[xX]([0-9a-fA-F]+);", "\\1", e), 16L)),
             character(1), USE.NAMES = FALSE)
    })
    s <- gsub("&nbsp;", " ", s, fixed = TRUE)
    s <- gsub("&lt;", "<", s, fixed = TRUE)
    s <- gsub("&gt;", ">", s, fixed = TRUE)
    s <- gsub("&quot;", "\"", s, fixed = TRUE)
    s <- gsub("&apos;", "'", s, fixed = TRUE)
    s <- gsub("&amp;", "&", s, fixed = TRUE)
    s
  }
  x <- vapply(x, decode_one, character(1), USE.NAMES = FALSE)
  # No-break/narrow spaces (decoded "&#160;"/"&nbsp;" or already present in the
  # source) become plain spaces: they render invisibly but count as non-space
  # in regex classes, which would let a "no-space run" span whole sentences.
  x <- gsub("[\u00a0\u202f]", " ", x)
  gsub("[\u2013\u2010]", "-", x)
}

# Strip text noise that would otherwise surface as corpus terms or label
# candidates: URLs (including signed URLs with their query strings), HTML tags
# and stray closing-tag fragments ("</ p"), and over-long no-space tokens
# (base64/signature residue). Content words around the noise are kept.
sanitize_corpus_noise <- function(x) {
  # perl = TRUE throughout: the default TRE engine mis-evaluates a bounded
  # repetition of \S ("\\S{80,}") against long strings, matching across spaces
  # and wiping whole texts.
  x <- gsub("(https?://|www\\.)\\S+", " ", x, perl = TRUE)
  x <- gsub("\\S*&key-pair-id=\\S*", " ", x, perl = TRUE)
  x <- gsub("</?[A-Za-z][^>]*>", " ", x, perl = TRUE)
  x <- gsub("<\\s*/\\s*[A-Za-z]*>?", " ", x, perl = TRUE)
  x <- gsub("\\S{80,}", " ", x, perl = TRUE)
  x
}

# Tight-colon tokens that keep their colon instead of splitting (matched as the
# whole word:word token). Extend as legitimate ratio-style terms are found.
COLON_KEEP_TOKENS <- c("80:20", "50:50")

# Split a text into punctuation-delimited segments for n-gram formation, so
# that no n-gram crosses a clause/subtitle boundary and no intra-word
# punctuation compound is broken. A punctuation mark splits when whitespace
# (or a string edge, or another boundary) adjoins it; a mark tight between two
# word characters stays inside its token. Deviations: colon, em dash, pipe and
# underscore always split (underscore because it is the n-gram joiner
# character); colon keep-list tokens and multi-period abbreviation chains
# ("U.S.", "e.g." — trailing period included) stay whole; a balanced (word)
# pair fused to a word character on at least one side keeps its parens as
# token content ("(in)justice", "micro(nano)") while its spaced outer side
# still bounds the segment; a run of >= 2 consecutive punctuation marks always
# splits as a unit. Placeholders \x01 (chain periods), \x03 (kept colons),
# \x04/\x05 (kept parens) and \x02 (boundaries) cannot occur in decoded
# titles. Returns a character vector of trimmed, whitespace-collapsed,
# non-empty segments; case is preserved. NA/empty input -> character(0).
punctuation_segments <- function(text) {
  text <- if (is.null(text) || is.na(text)) "" else text
  text <- sanitize_corpus_noise(decode_html_entities(text))
  # C0 control characters are removed before anything else: \x01-\x05 are this
  # function's own placeholders, so a source string containing them would be
  # restored as a period/colon/paren or silently split the text
  text <- gsub("[\x01-\x08\x0b\x0c\x0e-\x1f]", " ", text)
  # soft hyphen and zero-width characters render as nothing but count as
  # non-space, so they would be kept inside a token and stop it matching the
  # same word spelled without them
  text <- gsub("[\u00ad\u200b\u200c\u200d\ufeff]", "", text)
  # normalize spelling variants to one token identity (decode already maps
  # en dash U+2013 and hyphen U+2010 to "-"); a tight "--" is a TeX en dash
  # inside a compound, a spaced "--" is left as a run to split
  text <- gsub("\u2011", "-", text)
  text <- gsub("[\u2019\u2018\u02bc]", "'", text)
  text <- gsub("\uff1a", ":", text)
  text <- gsub("(?<=[^\\s-])--(?=[^\\s-])", "-", text, perl = TRUE)
  # protect abbreviation chains (>= 2 single-letter.period components) before
  # any boundary rule, so their periods - the trailing one included - survive
  m <- gregexpr("(?<![\\p{L}\\p{N}])(?:\\p{L}\\.){2,}", text, perl = TRUE)
  regmatches(text, m) <- lapply(regmatches(text, m), function(v) {
    gsub(".", "\x01", v, fixed = TRUE)
  })
  # protect keep-list colons (whole-token match, bounded by non-word chars)
  for (tok in COLON_KEEP_TOKENS) {
    esc <- gsub("([^\\p{L}\\p{N}])", "\\\\\\1", tok, perl = TRUE)
    pat <- paste0("(?<![\\p{L}\\p{N}])", esc, "(?![\\p{L}\\p{N}])")
    text <- gsub(pat, gsub(":", "\x03", tok, fixed = TRUE), text, perl = TRUE)
  }
  # protect tight wordplay parens: a balanced (word) pair fused to a word
  # character on at least one side ("(in)justice", "micro(nano)", "S(C)ENTINEL")
  # is one token and keeps its parens. Its spaced outer side is still a segment
  # boundary, so the wordplay token cannot fuse into an n-gram across the space.
  # Pairs spaced on both sides ("model (ML) selection") are untouched and split
  # as before, as does a pair abutting other punctuation ("(LLM)-Powered" - the
  # run rule wins there).
  text <- gsub("(?<=[\\p{L}\\p{N}])\\(([\\p{L}\\p{N}]+)\\)", "\x04\\1\x05", text, perl = TRUE)
  text <- gsub("\\(([\\p{L}\\p{N}]+)\\)(?=[\\p{L}\\p{N}])", "\x04\\1\x05", text, perl = TRUE)
  text <- gsub("(^|\\s)\x04", "\\1\x02\x04", text, perl = TRUE)
  text <- gsub("\x05(?=\\s|$)", "\x05\x02", text, perl = TRUE)
  # a run of consecutive punctuation marks splits as a unit, whatever its
  # members or spacing; handled before the single-mark rules
  punct <- "[^\\p{L}\\p{N}\\s\x01\x02\x03\x04\x05]"
  text <- gsub(paste0(punct, "{2,}"), "\x02", text, perl = TRUE)
  # always-split marks, regardless of spacing
  text <- gsub("[\u2014|:_]", "\x02", text)
  # the spacing rule for the remaining single marks: whitespace, a boundary or
  # a string edge on either side makes the mark a boundary; tight marks keep
  text <- gsub(paste0("(^|[\\s\x02])", punct), "\\1\x02", text, perl = TRUE)
  text <- gsub(paste0(punct, "([\\s\x02]|$)"), "\x02\\1", text, perl = TRUE)
  text <- gsub("\x01", ".", text, fixed = TRUE)
  text <- gsub("\x03", ":", text, fixed = TRUE)
  text <- gsub("\x04", "(", text, fixed = TRUE)
  text <- gsub("\x05", ")", text, fixed = TRUE)
  segments <- strsplit(text, "\x02", fixed = TRUE)[[1]]
  segments <- trimws(gsub("\\s+", " ", segments))
  segments[nzchar(segments)]
}

# Shared n-gram candidate builder for the heuristic-keyword synthesizer
# (replace_keywords_if_empty) and the last-resort fallback label
# (title_abstract_fallback_label). Same method as paper_title_ngrams: segment
# the text at punctuation boundaries (punctuation_segments — tight compounds
# like "covid-19" or "R&D" stay whole), form n-grams per segment on the
# stopword-RETAINING token stream, then drop n-grams that start or end with a
# stopword — so interior stopwords survive ("biomedical big data" stays a
# trigram; the fused "biomedical data" bigram is never formed). Stopword
# matching is case-insensitive so the outcome does not depend on source
# casing.
#   text            : one string (title, or title + abstract).
#   ngram_lengths   : which n-gram sizes to form; may include 1 for unigrams.
#   include_unigrams: alias for putting 1 in ngram_lengths — returns single
#                     tokens that are neither stopwords nor purely numeric (a
#                     lone number/year is noise; digits stay inside tokens).
# Returns a character vector of "_"-joined n-grams / bare tokens, in formation
# order (not de-duplicated - callers count frequencies; a caller that needs
# per-text dedup wraps the call in unique()).
ngram_candidates <- function(text, stops, ngram_lengths = c(2, 3),
                             include_unigrams = FALSE) {
  # length 1 is the same switch as include_unigrams; unigrams take the
  # token-filter path below, never the n-gram keep-filter
  include_unigrams <- include_unigrams || 1 %in% ngram_lengths
  ngram_lengths <- ngram_lengths[ngram_lengths != 1]
  # punctuation_segments performs the entity/URL/HTML hygiene itself; forming
  # n-grams per segment keeps them from crossing a punctuation boundary
  segments <- punctuation_segments(text)
  if (!length(segments)) return(character(0))
  stops_lower <- tolower(stops)
  grams <- unlist(lapply(ngram_lengths, function(n) expand_ngrams(segments, n)))
  grams <- unlist(strsplit(paste(grams, collapse = " "), " "))
  grams <- grams[nzchar(grams)]
  keep <- vapply(grams, function(g) {
    toks <- strsplit(g, "_", fixed = TRUE)[[1]]
    length(toks) >= 2 &&
      !(tolower(toks[1]) %in% stops_lower) &&
      !(tolower(toks[length(toks)]) %in% stops_lower) &&
      toks[1] != toks[length(toks)]
  }, logical(1), USE.NAMES = FALSE)
  out <- grams[keep]
  if (include_unigrams) {
    # tokens may now carry tight punctuation, so a purely numeric token can
    # contain separators too ("4.0", "350,067", "2013-2023") - all stay noise
    words <- unlist(strsplit(segments, " ", fixed = TRUE))
    words <- words[nzchar(words) & !(tolower(words) %in% stops_lower) &
                     !grepl("^[0-9]+([.,:-][0-9]+)*$", words)]
    out <- c(words, out)
  }
  out
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

# --- Label-generation debug dumps ------------------------------------------------
# Fine-grained, DEBUG-gated traces of how each cluster's area label is built, for
# backtracking a label to its inputs: the corpus text that feeds tf-idf, the tf-idf
# candidate terms with their weights, the rank-source provenance (Modes 1-3), the
# terms removed by the exclusion list, and the per-cluster label provenance (which
# path produced it, plus the label before/after casing). Each keyed on VIS_ID via
# dump_data; all no-ops unless LOGLEVEL=DEBUG, and never fatal.

# Per-cluster corpus document text (what tf-idf actually tokenizes). One row/cluster.
dump_corpus_text <- function(corpus, stage) {
  if (!debug_enabled()) return(invisible(NULL))
  tryCatch({
    txt <- vapply(seq_along(corpus),
                  function(k) paste(as.character(content(corpus[[k]])), collapse = " "),
                  character(1))
    dump_data(data.frame(cluster = seq_along(txt), text = txt, stringsAsFactors = FALSE), stage)
  }, error = function(e) vslog$warn(paste("dump_corpus_text failed:", conditionMessage(e))))
}

# Per-cluster tf-idf candidate terms, weight-ordered, with their scores. One row per
# (cluster, term): the candidate pool that selection/ranking draws from.
dump_tfidf_candidates <- function(tfidf_top, stage) {
  if (!debug_enabled()) return(invisible(NULL))
  tryCatch({
    rows <- lapply(seq_along(tfidf_top), function(k) {
      w <- tfidf_top[[k]]
      if (is.null(w) || !length(w) || is.null(names(w))) return(NULL)
      data.frame(cluster = k, weight_rank = seq_along(w),
                 term = gsub("_", " ", names(w)), tfidf = as.numeric(w),
                 stringsAsFactors = FALSE)
    })
    rows <- do.call(rbind, rows[!vapply(rows, is.null, logical(1))])
    if (!is.null(rows) && nrow(rows)) dump_data(rows, stage)
  }, error = function(e) vslog$warn(paste("dump_tfidf_candidates failed:", conditionMessage(e))))
}

# Per-cluster rank-source token-sets (Modes 1-3): which provenance set (cleaned,
# mesh_specific, ...) each candidate token belongs to — i.e. what fixes its rank.
dump_rank_sources <- function(rank_sources, stage) {
  if (!debug_enabled() || is.null(rank_sources)) return(invisible(NULL))
  tryCatch({
    rows <- list()
    for (src in names(rank_sources)) {
      per_cluster <- rank_sources[[src]]
      for (k in seq_along(per_cluster)) {
        toks <- per_cluster[[k]]
        if (length(toks)) rows[[length(rows) + 1L]] <-
          data.frame(cluster = k, source = src, term = gsub("_", " ", toks),
                     stringsAsFactors = FALSE)
      }
    }
    if (length(rows)) dump_data(do.call(rbind, rows), stage)
  }, error = function(e) vslog$warn(paste("dump_rank_sources failed:", conditionMessage(e))))
}

# Per-cluster terms removed by the exclusion list (tf-idf candidates before vs after
# drop_excluded_terms). Makes each exclusion drop explicit.
dump_excluded_terms <- function(before, after, stage) {
  if (!debug_enabled()) return(invisible(NULL))
  tryCatch({
    rows <- lapply(seq_along(before), function(k) {
      b <- before[[k]]; a <- after[[k]]
      if (is.null(b) || !length(b) || is.null(names(b))) return(NULL)
      dropped <- setdiff(names(b), names(a))
      if (!length(dropped)) return(NULL)
      data.frame(cluster = k, term = gsub("_", " ", dropped),
                 tfidf = as.numeric(b[dropped]), stringsAsFactors = FALSE)
    })
    rows <- do.call(rbind, rows[!vapply(rows, is.null, logical(1))])
    if (!is.null(rows) && nrow(rows)) dump_data(rows, stage)
  }, error = function(e) vslog$warn(paste("dump_excluded_terms failed:", conditionMessage(e))))
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
# type_counts case-insensitively. The lookup is exact on everything but case —
# in particular hyphen-preserving: the vocabulary regularly holds a
# de-hyphenated twin of a hyphenated token (source spelling variants), and a
# hyphen-insensitive lookup would respell the token instead of re-casing it.
# Falls back to the input token if there is no match. Edge hyphens are
# separator debris, not part of the token, and are trimmed before the lookup
# (a token that is only hyphens is returned unchanged).
match_keyword_case <- function(x, type_counts) {
  stripped <- gsub("^-+|-+$", "", x)
  if (nzchar(stripped)) x <- stripped
  y <- names(type_counts[which(tolower(names(type_counts)) == tolower(x))][1])
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

# Controlled emulation of the legacy prune_ngrams quirks, applied on top of
# the shared generator's per-title output (Setting 0 only — the flag keeps the
# generator as the single code path while reproducing the reference
# behaviour):
#   1. an n-gram is also dropped when an EDGE TOKEN occurs as a substring of
#      any stopword (the legacy stri_detect_fixed haystack/needle inversion —
#      over-pruning vs the generator's exact matching);
#   2. a title whose surviving n-grams of one length number <= 1 loses them,
#      and its slot is removed from the per-title list (shifting the later
#      subject recycling exactly as the legacy pipeline did).
legacy_prune_quirks <- function(per_title, stops) {
  per_title <- lapply(per_title, function(grams) {
    if (!length(grams)) return(grams)
    keep <- vapply(grams, function(g) {
      toks <- strsplit(g, "_", fixed = TRUE)[[1]]
      !any(stringi::stri_detect_fixed(stops, tolower(toks[1]))) &&
        !any(stringi::stri_detect_fixed(stops, tolower(toks[length(toks)])))
    }, logical(1), USE.NAMES = FALSE)
    grams[keep]
  })
  per_title[vapply(per_title, length, integer(1)) > 1]
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


# LEGACY, no production callers (the Mode-0 corpus builder now generates
# through ngram_candidates): extract pruned bi- and tri-grams from a set of
# titles (see prune_ngrams) and return them concatenated. Kept as the
# reference implementation for tests until the cleanup
# Note: ngram_lengths is unused —
# lengths 2 and 3 are hardcoded.
get_title_ngrams <- function(titles, stops, ngram_lengths) {
  # for ngrams: we have to collapse with "_" or else tokenizers will split ngrams again at that point and we'll be left with unigrams
  per_title <- function(n) lapply(titles, function(segments) {
    paste(unlist(expand_ngrams(segments, n)), collapse = " ")
  })
  titles_bigrams = prune_ngrams(per_title(2), stops)
  titles_trigrams = prune_ngrams(per_title(3), stops)
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

