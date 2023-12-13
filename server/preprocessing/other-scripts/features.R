library(stringr)
vflog <- getLogger('vis.features')

TypeCountTokenizer <- function(x) {
  unlist(strsplit(as.character(x), "[^[:alnum:]-]"))
}


create_corpus <- function(metadata, text, stops) {
  # log text example content
  vflog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "text example content:", text$content[1], collapse="\n"))
  docs <- data.frame(doc_id = text$id, text = text$content)
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
  # log example content from the corpus object
  vflog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "corpus example content:", corpus[[1]]$content, collapse="\n"))
  tdm <- TermDocumentMatrix(corpus)
  # log all available information about tdm
  vflog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "tdm dimensions:", dim(tdm)))
  vflog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "tdm sparsity:", sum(tdm == 0) / prod(dim(tdm))))
  vflog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "tdm max value:", max(tdm)))
  vflog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "tdm min value:", min(tdm)))
  vflog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "tdm NA values:", sum(is.na(tdm))))
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