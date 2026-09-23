# text_hygiene.R
# Corpus/text hygiene and punctuation-aware segmentation: HTML-entity decode,
# URL/noise stripping, MeSH-marker cleanup, and punctuation_segments — the
# shared segmentation every n-gram generation site builds on
# (docs/keyword-punctuation.md). Sourced by summarize.R.


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
