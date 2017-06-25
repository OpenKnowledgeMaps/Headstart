library(tm)

create_tdm_matrix <- function(metadata, text, stops, sparsity=1) {
  m <- list(content = "content", id = "id")

  my_reader <- readTabular(mapping = m)
  (corpus <- Corpus(DataframeSource(text),
                    readerControl = list(reader = my_reader)))

  # Replace non-convertible bytes in with strings showing their hex codes,
  # see http://tm.r-forge.r-project.org/faq.html
  corpus <- tm_map(corpus,  content_transformer(function(x) iconv(enc2utf8(x),
                                                sub = "byte")))
  corpus <- tm_map(corpus, removePunctuation)
  corpus <- tm_map(corpus, content_transformer(tolower))
  corpus <- tm_map(corpus, removeWords, stops)
  corpus <- tm_map(corpus, stripWhitespace)

  metadata_full_subjects <- replace_keywords_if_empty(corpus, metadata, stops)

  corpus_unstemmed <- corpus
  corpus <- tm_map(corpus, stemDocument)
  tdm <- TermDocumentMatrix(corpus)
  if (sparsity < 1) {
    tdm <- removeSparseTerms(tdm, sparsity)
  }
  tdm_matrix <- t(as.matrix(tdm))

  return(list(tdm_matrix = tdm_matrix,
              metadata_full_subjects = metadata_full_subjects))
}

deduplicate_titles <- function(metadata, list_size) {
  output <- c()
  max_replacements <- length(metadata$id) - list_size
  ids <- metadata$id
  titles <- metadata$title
  count <- 1

  lv_matrix <- stringdistmatrix(titles, method = "lv")
  length_matrix <- stri_length(titles)
  n <- length(length_matrix)
  str_matrix <- matrix(length_matrix, n, n)
  str_matrix_t <- t(str_matrix)
  str_max_matrix <- pmax(str_matrix, str_matrix_t)
  lv_ratio_matrix <- as.matrix(lv_matrix) / str_max_matrix

  duplicates <- lv_ratio_matrix < 1 / 15.83
  duplicates[lower.tri(duplicates, diag = TRUE)] <- NA
  remove_ids <- which(apply(duplicates, 2, FUN = function(x){any(x)}))
  remove_ids <- ids[remove_ids]
  output <- head(remove_ids, max_replacements)

  return(output)

}

make_ngrams <- function(candidates, n) {
  candidates_ngrams <- lapply(
                                lapply(candidates,
                                       function(x) unlist(
                                                     lapply(
                                                       ngrams(
                                                         unlist(
                                                           strsplit(x,
                                                                    split = " "
                                                           )
                                                         ), n
                                                       ),
                                                       paste, collapse = "_"
                                                     )
                                                   )
                                ), paste, collapse = " "
                              )
  return(candidates_ngrams)
}

replace_keywords_if_empty <- function(corpus, metadata, stops) {

  missing_subjects <- which(lapply(metadata$subject,
                                  function(x) {nchar(x)}) <= 1)
  candidates <- mapply(paste,
                      metadata$title[missing_subjects],
                      metadata$paper_abstract[missing_subjects])
  candidates <- lapply(candidates, tolower)
  candidates <- lapply(candidates,
                       function(x)paste(removeWords(x, stops), collapse = ""))
  candidates <- lapply(candidates, function(x) {gsub("[^[:alpha:]]", " ", x)})
  candidates <- lapply(candidates, function(x) {gsub(" +", " ", x)})
  candidates_bigrams <- make_ngrams(candidates, 2)
  # candidates_trigrams <- make_ngrams(candidates, 3)
  candidates <- mapply(paste, candidates, candidates_bigrams)
  # candidates <- lapply(candidates, function(x) {gsub('\\b\\d+\\s','', x)})

  nn_corpus <- Corpus(VectorSource(candidates))
  nn_tfidf <- TermDocumentMatrix(nn_corpus,
                                control = list(tokenize = SplitTokenizer,
                                               weighting = function(x)
                                                           weightSMART(x,
                                                             spec = "ntn")))
  tfidf_top <- apply(nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);
                                                     x2[x2 >= x2[3]]
                                              }
               )
  tfidf_top_names <- lapply(tfidf_top, names)
  replacement_keywords <- lapply(tfidf_top_names,
                                 function(x) filter_out_nested_ngrams(x, 3))
  replacement_keywords <- lapply(replacement_keywords,
                                FUN = function(x) {paste(unlist(x),
                                                         collapse = ";")
                                                  }
                          )
  replacement_keywords <- gsub("_", " ", replacement_keywords)

  metadata$subject[missing_subjects] <- replacement_keywords

  return(metadata)
}


levenshtein_ratio <- function(a, b) {
  lv_dist <- stringdist(a, b, method = "lv")
  lv_ratio <- lv_dist / (max(stri_length(a), stri_length(b)))
  return(lv_ratio)
}

SplitTokenizer <- function(x) {
  tokens <- unlist(
              lapply(
                strsplit(words(x), split = ";"),
                paste),
              use.names <- FALSE)
  return(tokens)
}

filter_out_nested_ngrams <- function(top_ngrams, top_n) {
  top_names <- list()
  for (ngram in top_ngrams) {
    if (ngram == "")
      next;

    ngram_in_top_names <- stringi::stri_detect_fixed(top_names, ngram)
    top_names_with_ngram <- sapply(top_names,
                                   function(x)(stringi::stri_detect_fixed(ngram, x)))

    # ngram substring of any top_name, and no top_name substring of ngram
    # -> skip ngram
    if (any(ngram_in_top_names == TRUE) &&
        all(top_names_with_ngram == FALSE)) {}
    # ngram not substring of any top_name, but at least one top_name is a
    # substring of ngram -> replace top_name with ngram
    else if (all(ngram_in_top_names == FALSE) &&
             any(top_names_with_ngram == TRUE)) {
      top_names[which(top_names_with_ngram)] <- ngram
    }
    # a not substring of b, b not substring of a -> add b, next
    else if (all(ngram_in_top_names == FALSE) &&
             all(top_names_with_ngram == FALSE)) {
      top_names <- unlist(c(top_names, ngram))
    }
  }
  return(head(unique(top_names), top_n))
}
