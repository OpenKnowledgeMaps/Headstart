
get_stopwords <- function(lang, add_stop_words, testing) {
  stops <- stopwords(lang)

  if (!is.null(add_stop_words)){
    if (isTRUE(testing)) {
      add_stop_path <- paste0("../../resources/", add_stop_words, ".stop")
    } else {
      add_stop_path <- paste0("../resources/", add_stop_words, ".stop")
    }
    additional_stops <- scan(add_stop_path, what="", sep="\n")
    stops = c(stops, additional_stops)
  }
  return(stops)
}


filter_duplicates <- function(metadata, text, list_size) {
  #If list_size is greater than -1 and smaller than the actual list size, deduplicate titles
  if(list_size > -1) {
    output = deduplicate_titles(metadata, list_size)
    text = subset(text, !(id %in% output))
    metadata = subset(metadata, !(id %in% output))

    text = head(text, list_size)
    metadata = head(metadata, list_size)
  }
  return(list(metadata=metadata, text=text))
}


deduplicate_titles <- function(metadata, list_size) {
  output <- c()

  metadata$oa_state[metadata$oa_state == "2"] <- 0
  metadata = metadata[order(-as.numeric(metadata$oa_state),-stri_length(metadata$subject),
                      -stri_length(metadata$paper_abstract),-stri_length(metadata$authors),
                      -stri_length(metadata$published_in)),]

  index = (grepl(" ", metadata$title) == FALSE | stri_length(metadata$title) < 15)
  metadata$title[index] <- paste(metadata$title[index], metadata$authors[index], sep=" ")

  num_items = length(metadata$id)
  max_replacements = ifelse(num_items > list_size, num_items - list_size, -1)

  ids = metadata$id
  titles = metadata$title
  titles = unlist(lapply(titles, tolower))
  count = 1


  lv_matrix = stringdistmatrix(titles, method="lv")
  length_matrix <- stri_length(titles)
  n = length(length_matrix)
  str_matrix = matrix(length_matrix, n, n)
  str_matrix_t <- t(str_matrix)
  str_max_matrix = pmax(str_matrix, str_matrix_t)
  lv_ratio_matrix = as.matrix(lv_matrix)/str_max_matrix

  duplicates <- lv_ratio_matrix < 1/15.83
  duplicates[lower.tri(duplicates, diag=TRUE)] <- NA
  remove_ids <- which(apply(duplicates, 2, FUN=function(x){any(x)}))
  output = ids[remove_ids]

  print(paste0("Number of max. duplicate entries: ", length(output)))

  if(max_replacements > -1) {
    output = head(output, max_replacements)
  }

  print(paste0("Number of duplicate entries: ", length(output)))

  return(output)

}

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

  return(list(corpus = corpus, corpus_unstemmed = corpus_unstemmed))
}

create_tdm_matrix <- function(corpus, sparsity=1) {
  tdm <- TermDocumentMatrix(corpus)
  if(sparsity < 1) {
    tdm <- removeSparseTerms(tdm, sparsity)
  }
  tdm_matrix = t(as.matrix(tdm))
  return(tdm_matrix)
}

replace_keywords_if_empty <- function(corpus, metadata, stops) {

  missing_subjects = which(lapply(metadata$subject, function(x) {nchar(x)}) <= 1)
  candidates = mapply(paste, metadata$title[missing_subjects], metadata$paper_abstract[missing_subjects])
  candidates = lapply(candidates, tolower)
  candidates = lapply(candidates, function(x)paste(removeWords(x, stops), collapse=""))
  candidates = lapply(candidates, function(x) {gsub("[^[:alpha:]]", " ", x)})
  candidates = lapply(candidates, function(x) {gsub(" +", " ", x)})
  candidates_bigrams = lapply(lapply(candidates, function(x)unlist(lapply(ngrams(unlist(strsplit(x, split=" ")), 2), paste, collapse="_"))), paste, collapse=" ")
  #candidates_trigrams = lapply(lapply(candidates, function(x)unlist(lapply(ngrams(unlist(strsplit(x, split=" ")), 3), paste, collapse="_"))), paste, collapse=" ")
  candidates = mapply(paste, candidates, candidates_bigrams)
  #candidates = lapply(candidates, function(x) {gsub('\\b\\d+\\s','', x)})

  nn_corpus = Corpus(VectorSource(candidates))
  nn_tfidf = TermDocumentMatrix(nn_corpus, control = list(tokenize = SplitTokenizer, weighting = function(x) weightSMART(x, spec="ntn")))
  tfidf_top = apply(nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>=x2[3]]})
  tfidf_top_names = lapply(tfidf_top, names)
  replacement_keywords <- lapply(tfidf_top_names, function(x) filter_out_nested_ngrams(x, 3))
  replacement_keywords = lapply(replacement_keywords, FUN = function(x) {paste(unlist(x), collapse=";")})
  replacement_keywords = gsub("_", " ", replacement_keywords)

  metadata$subject[missing_subjects] <- replacement_keywords

  return(metadata)

}


normalize_matrix <- function(tdm_matrix, method = "cosine") {
  distance_matrix_2 <- as.matrix(proxy::dist(tdm_matrix, method))
  distance_matrix = as.dist(distance_matrix_2)

  return(distance_matrix)
}
