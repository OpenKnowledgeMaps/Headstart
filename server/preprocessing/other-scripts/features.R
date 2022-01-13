library(stringr)
vflog <- getLogger('vis.features')

TypeCountTokenizer <- function(x) {
  unlist(strsplit(as.character(x), "[^[:alnum:]-]"))
}


create_corpus <- function(metadata, text, stops) {
  docs <- data.frame(doc_id = text$id, text = text$content)
  corpus <- VCorpus(DataframeSource(docs))

  # Replace non-convertible bytes in with strings showing their hex codes,
  # see http://tm.r-forge.r-project.org/faq.html
  corpus <- tm_map(corpus, content_transformer(function(x) iconv(enc2utf8(x), sub = "byte")))
  unlowered <- corpus
  corpus <- tm_map(corpus, removePunctuation)
  corpus <- tm_map(corpus, content_transformer(tolower))
  corpus <- tm_map(corpus, removeWords, stops)
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

concatenate_features <- function(...) {
  # expects a list of feature matrices which can be extended horizontally
  return(cbind(...))
}