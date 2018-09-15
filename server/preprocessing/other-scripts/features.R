vflog <- getLogger('vis.features')

create_corpus <- function(metadata, text, stops) {
  valid <- getStemLanguages()
  text["language"] <- unlist(lapply(metadata$lang_detected,
                    function(x) {
                      if (x %in% valid) {
                        x
                      } else {
                        "english"
                      }}))
  mapping <- list(content = "content", id = "id", language = "language")
  myReader <- readTabular(mapping = mapping)

  corpus <- Corpus(DataframeSource(text),
                   readerControl = list(reader = myReader))

  # Replace non-convertible bytes in with strings showing their hex codes,
  # see http://tm.r-forge.r-project.org/faq.html
  corpus <- tm_map(corpus, content_transformer(function(x) iconv(enc2utf8(x), sub = "byte")))
  corpus <- tm_map(corpus, removePunctuation)
  corpus <- tm_map(corpus, content_transformer(tolower))
  corpus <- tm_map(corpus, remove_stop_words)
  corpus <- tm_map(corpus, stripWhitespace)
  unstemmed = corpus
  stemmed <- tm_map(corpus, stemDocument)

  return(list(stemmed = stemmed, unstemmed = unstemmed))
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
  distance_matrix <- as.matrix(proxy::dist(tdm_matrix, method))
  return(distance_matrix)
}

concatenate_features <- function(...) {
  # expects a list of feature matrices which can be extended horizontally
  return(cbind(...))
}

remove_stop_words <- function(x, language = "english") UseMethod("remove_stop_words", x)
remove_stop_words.character <- function(x, language = "english") {
  y <- unlist(strsplit(x, " "))
  stops <- get_stopwords(language, TESTING)
  stopword <- unlist(lapply(y, function(z) z %in% stops))
  doc <- y[which(!stopword)]
  doc <- paste(doc, collapse = " ")
}
remove_stop_words.PlainTextDocument <- function(x, language = meta(x, "language")) {
  content_transformer(remove_stop_words.character)(x, language)
}
