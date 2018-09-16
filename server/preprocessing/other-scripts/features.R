fplog <- getLogger('vis.features')

create_corpus <- function(metadata, text, stops) {
  m <- list(content = "content", id = "id")

  myReader <- readTabular(mapping = m)
  (corpus <- Corpus(DataframeSource(text), readerControl = list(reader = myReader)))

  # Replace non-convertible bytes in with strings showing their hex codes, see http://tm.r-forge.r-project.org/faq.html
  corpus <- tm_map(corpus,  content_transformer(function(x) iconv(enc2utf8(x), sub = "byte")))
  corpus <- tm_map(corpus, removePunctuation)
  corpus <- tm_map(corpus, content_transformer(tolower))
  corpus <- tm_map(corpus, removeWords, stops)
  corpus <- tm_map(corpus, stripWhitespace)
  corpus_unstemmed = corpus

  corpus <- tm_map(corpus, stemDocument)

  return(list(stemmed = corpus, unstemmed = corpus_unstemmed))
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
  return(distance_matrix)
}

concatenate_features <- function(...) {
  # expects a list of feature matrices which can be extended horizontally
  return(cbind(...))
}
