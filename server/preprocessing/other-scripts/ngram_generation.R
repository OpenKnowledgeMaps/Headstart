# ngram_generation.R
# The shared n-gram generator (ngram_candidates) and its helpers, the
# legacy-quirk emulation (legacy_prune_quirks, Setting 0 in Mode 0), the
# nested-n-gram filter, and the legacy reference implementations kept for
# tests until the cleanup.
# Sourced by summarize.R.



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
