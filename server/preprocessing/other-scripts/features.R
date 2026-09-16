library(stringr)
vflog <- getLogger('vis.features')

TypeCountTokenizer <- function(x) {
  unlist(strsplit(as.character(x), "[^[:alnum:]-]"))
}


create_corpus <- function(metadata, text, stops) {
  # Corpus-side text hygiene (helpers in summarize.R): decode HTML entities
  # before removePunctuation can reduce them to bare digits, and strip
  # URL/HTML/signature noise that would otherwise become corpus terms. Runs
  # before the unlowered snapshot, so the casing vocabulary (get_type_counts)
  # is cleaned as well.
  content <- sanitize_corpus_noise(decode_html_entities(text$content))
  docs <- data.frame(doc_id = text$id, text = content)
  corpus <- VCorpus(DataframeSource(docs))

  # Replace non-convertible bytes in with strings showing their hex codes,
  # see http://tm.r-forge.r-project.org/faq.html
  corpus <- tm_map(corpus, content_transformer(function(x) iconv(enc2utf8(x), sub = "byte")))
  unlowered <- corpus
  corpus <- tm_map(corpus, removePunctuation)
  corpus <- tm_map(corpus, content_transformer(tolower))
  batch_size <- 1000
  total_length <- length(stops)
  for (i in seq(1, total_length, batch_size)) {
    try(corpus <- tm_map(corpus, removeWords, stops[i:min(i+batch_size -1, total_length)]))
  }
  corpus <- tm_map(corpus, stripWhitespace)
  unstemmed <- corpus
  stemmed <- tm_map(corpus, stemDocument)

  return(list(unlowered = unlowered, stemmed = stemmed, unstemmed = unstemmed))
}


create_tdm_matrix <- function(corpus, sparsity=1) {
  tdm <- TermDocumentMatrix(corpus)
  if(sparsity < 1) {
    tdm <- removeSparseTerms(tdm, sparsity)
  }
  tdm_matrix = t(as.matrix(tdm))
  return(tdm_matrix)
}

get_distance_matrix <- function(tdm_matrix, method = "cosine") {
  distance_matrix <- as.matrix(dist(tdm_matrix, method))
  if (nrow(distance_matrix) == 0) {
    colnames(distance_matrix) <- labels(tdm_matrix)$Docs
  }
  return(distance_matrix)
}

get_type_counts <- function(corpus) {
  type_counts = apply(TermDocumentMatrix(corpus, control=list(tokenize=TypeCountTokenizer, tolower = FALSE)), 1, sum)
  return(type_counts)
}


# TRUE for a string written entirely in capitals: it has letters and none of
# them is lowercase. Digits and punctuation do not count either way.
is_allcaps <- function(s) {
  s <- as.character(s)
  !is.na(s) & nzchar(s) & grepl("[[:alpha:]]", s) & !grepl("[[:lower:]]", s)
}


# Lowercase the title span of every document whose title is ALL-CAPS, in the
# unlowered corpus that feeds the casing vocabulary (get_type_counts). A
# shouting title otherwise attests a capitalised spelling of every one of its
# words, and the casing restoration would carry that into the area labels.
# Documents are matched to metadata rows by id. The title is put through the
# same hygiene the document content received, so it matches verbatim; a title
# that does not match (altered by the noise sanitiser) is left as it is.
# Returns the modified corpus; the caller's other corpus copies are untouched.
lower_allcaps_titles <- function(corpus, metadata) {
  caps <- which(is_allcaps(metadata$title))
  if (!length(caps)) return(corpus)
  ids <- vapply(seq_along(corpus), function(k) as.character(meta(corpus[[k]], "id")), "")
  for (i in caps) {
    j <- match(as.character(metadata$id[i]), ids)
    if (is.na(j)) next
    title <- sanitize_corpus_noise(decode_html_entities(metadata$title[i]))
    doc <- corpus[[j]]
    content(doc) <- sub(title, tolower(title), content(doc), fixed = TRUE)
    corpus[[j]] <- doc
  }
  corpus
}

concatenate_features <- function(...) {
  # expects a list of feature matrices which can be extended horizontally
  return(cbind(...))
}