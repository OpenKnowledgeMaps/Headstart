# label_casing.R
# Final label casing: restore corpus casing per word and capitalise each
# comma-separated phrase. Sourced by summarize.R.



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


# Attestation floor for an ALL-CAPS variant: one seen fewer times than this
# yields to the best mixed/Titlecase variant, so a single shouting title does
# not set a word's casing for the whole map. At 2 only a one-occurrence variant
# yields; a variant attested twice or more sets the casing even against a
# mixed-case twin.
CAPS_ATTESTATION_FLOOR <- 2


# Return the canonical (original-corpus) casing of a token: looks it up in
# type_counts case-insensitively and picks among the variants by weight of
# evidence (see lookup_case). Edge hyphens are separator debris, not part of
# the token, and are trimmed before the lookup (a token that is only hyphens is
# returned unchanged).
#
# The lookup is on the whole token first, so a hyphenated token is restored as
# one unit ("SARS-CoV-2"). The vocabulary regularly holds a de-hyphenated twin
# of a hyphenated token (source spelling variants), and a hyphen-insensitive
# lookup would respell the token instead of re-casing it, so the whole-token
# lookup is exact on everything but case. A token the vocabulary does not hold
# as a whole is restored piecewise: the vocabulary tokeniser splits on every
# character but letters, digits and hyphens, so a token such as "hiv/aids",
# "(sdgs)", "alzheimer's" or "rj.45" never matches whole; each of its
# alphanumeric runs is looked up on its own and the separators are kept
# ("HIV/AIDS", "(SDGs)", "Alzheimer's", "RJ.45"). A run without a match keeps
# its spelling, so an unknown token comes back unchanged.
match_keyword_case <- function(x, type_counts) {
  stripped <- gsub("^-+|-+$", "", x)
  if (nzchar(stripped)) x <- stripped
  hit <- lookup_case(x, type_counts)
  if (!is.null(hit)) return(hit)
  if (!grepl("[^[:alnum:]]", x)) return(x)
  m <- gregexpr("[[:alnum:]]+", x)
  runs <- regmatches(x, m)[[1]]
  if (!length(runs)) return(x)
  regmatches(x, m) <- list(vapply(runs, function(r) {
    h <- lookup_case(r, type_counts)
    if (is.null(h)) r else h
  }, character(1), USE.NAMES = FALSE))
  x
}


# The casing pick for one vocabulary key: NULL when the vocabulary holds no
# variant of `x` (compared case-insensitively), else the chosen variant.
#
# The pick is a guarded majority: the most frequent variant wins, except that
# a non-lowercase variant must reach twice the lowercase count to displace
# lowercase (so an occasional capitalised sentence start does not promote a
# common noun), and an ALL-CAPS variant below CAPS_ATTESTATION_FLOOR yields.
# Ties break on count, then on the string in C order, so the result does not
# depend on the collation locale of the machine running the pipeline.
lookup_case <- function(x, type_counts) {
  idx <- which(tolower(names(type_counts)) == tolower(x))
  if (!length(idx)) return(NULL)

  variants <- names(type_counts)[idx]
  counts   <- as.numeric(type_counts[idx])
  lower    <- tolower(x)
  lower_n  <- sum(counts[variants == lower])

  keep <- variants != lower
  if (!any(keep)) return(lower)
  variants <- variants[keep]
  counts   <- counts[keep]
  is_caps  <- variants == toupper(variants) & grepl("[[:alpha:]]", variants)

  o <- order(-counts, variants, method = "radix")
  variants <- variants[o]; counts <- counts[o]; is_caps <- is_caps[o]

  pick <- 1
  if (is_caps[1] && counts[1] < CAPS_ATTESTATION_FLOOR && any(!is_caps)) {
    pick <- which(!is_caps)[1]
  }
  if (lower_n > 0 && counts[pick] < 2 * lower_n) return(lower)
  variants[pick]
}


# The vocabulary keys match_keyword_case consults for a label token: the token
# itself when the vocabulary holds it, else its alphanumeric runs (the
# piecewise fallback). Edge hyphens are trimmed as in match_keyword_case.
casing_units <- function(x, type_counts) {
  stripped <- gsub("^-+|-+$", "", x)
  if (nzchar(stripped)) x <- stripped
  if (tolower(x) %in% tolower(names(type_counts)) || !grepl("[^[:alnum:]]", x)) return(x)
  runs <- regmatches(x, gregexpr("[[:alnum:]]+", x))[[1]]
  if (length(runs)) runs else x
}


# Classify a spelling: lowercase / allcaps / titlecase / mixed. Used to report
# the shape of each casing decision (see casing_decisions).
casing_shape <- function(s) {
  if (!nzchar(s)) return("empty")
  if (identical(s, tolower(s))) return("lowercase")
  if (identical(s, toupper(s)) && grepl("[[:alpha:]]", s)) return("allcaps")
  titled <- paste0(toupper(substr(s, 1, 1)), tolower(substring(s, 2)))
  if (identical(s, titled)) return("titlecase")
  "mixed"
}


# Per-token record of the casing decisions behind a set of labels: the variants
# the vocabulary offered with their counts, the variant picked, and its shape.
# A token restored piecewise (see match_keyword_case) is recorded per
# alphanumeric run.
# Counting rows by `shape` gives a map's promotion rate away from lowercase,
# which is the quantity under qualitative review for the guarded-majority pick.
# Takes the labels BEFORE casing restoration. Debug-only (see dump_data).
casing_decisions <- function(clusterlabels, type_counts) {
  empty <- data.frame(token = character(0), chosen = character(0),
                      shape = character(0), lower_count = numeric(0),
                      chosen_count = numeric(0), n_variants = integer(0),
                      variants = character(0), stringsAsFactors = FALSE)
  tokens <- unlist(strsplit(unlist(clusterlabels), "[ ,]+"))
  tokens <- unique(tokens[nzchar(tokens)])
  if (!length(tokens)) return(empty)
  tokens <- unique(unlist(lapply(tokens, casing_units, type_counts = type_counts)))

  vocab_lower <- tolower(names(type_counts))
  rows <- lapply(tokens, function(t) {
    key <- tolower(t)
    idx <- which(vocab_lower == key)
    chosen <- match_keyword_case(t, type_counts)
    v <- names(type_counts)[idx]
    n <- as.numeric(type_counts[idx])
    o <- order(-n, v, method = "radix")
    data.frame(token = key,
               chosen = chosen,
               shape = casing_shape(chosen),
               lower_count = sum(n[v == key]),
               chosen_count = sum(n[v == chosen]),
               n_variants = length(idx),
               variants = paste(sprintf("%s(%g)", v[o], n[o]), collapse = " "),
               stringsAsFactors = FALSE)
  })
  do.call(rbind, rows)
}
