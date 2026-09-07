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
