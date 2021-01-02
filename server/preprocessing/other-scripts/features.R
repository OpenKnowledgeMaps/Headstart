vflog <- getLogger('vis.features')

create_corpus <- function(metadata, text, languages=c("en")) {
  valid <- getStemLanguages()
  text["languages"] <- languages
  mapping <- list(content = "content", id = "id", languages = "languages")
  myReader <- readTabular(mapping = mapping)

  corpus <- Corpus(DataframeSource(text),
                   readerControl = list(reader = myReader))

  # Replace non-convertible bytes in with strings showing their hex codes,
  # see http://tm.r-forge.r-project.org/faq.html
  corpus <- tm_map(corpus, content_transformer(function(x) iconv(enc2utf8(x), sub = "byte")))
  unlowered <- corpus
  corpus <- tm_map(corpus, removePunctuation)
  corpus <- tm_map(corpus, content_transformer(tolower))
  corpus <- tm_map(corpus, remove_stop_words)
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

concatenate_features <- function(...) {
  # expects a list of feature matrices which can be extended horizontally
  return(cbind(...))
}

remove_stop_words <- function(x, languages) UseMethod("remove_stop_words", x)
remove_stop_words.character <- function(x, languages) {
  y <- unlist(strsplit(x, " "))
  stops = list()
  for (lang in languages) {
    stops <- c(stops, get_stopwords(lang, TESTING))
  }
  stopword <- unlist(lapply(y, function(z) z %in% stops))
  doc <- y[which(!stopword)]
  doc <- paste(doc, collapse = " ")
}
remove_stop_words.PlainTextDocument <- function(x, languages = meta(x, "languages")) {
  content_transformer(remove_stop_words.character)(x, languages)
}
