
create_cluster_labels <- function(clusters, metadata_full_subjects,
                                  weightingspec, top_n,
                                  stops, taxonomy_separator = "/") {
  subjectlist <- list()
  for (k in seq(1, clusters$num_clusters)) {
    group <- c(names(clusters$groups[clusters$groups == k]))
    matches <- which(metadata_full_subjects$id %in% group)

    titles <-  metadata_full_subjects$title[c(matches)]
    subjects <- metadata_full_subjects$subject[c(matches)]

    titles <- lapply(titles, function(x) {gsub("[^[:alnum:]]", " ", x)})
    # titles <- lapply(titles, function(x)paste(unlist(strsplit(x, split="  ")), collapse=" "))
    titles <- lapply(titles, gsub, pattern = "  ", replacement = " ")
    titles <- lapply(titles, tolower)
    # for ngrams: we have to collapse with "_" or else tokenizers will split
    # ngrams again at that point and we'll be left with unigrams
    titles_bigrams <- make_ngrams(titles, 2)
    titles_bigrams <- filter_out(titles_bigrams, stops)
    titles_trigrams <- make_ngrams(titles, 3)
    titles_trigrams <- filter_out(titles_trigrams, stops)
    # titles_quadgrams <- make_ngrams(titles, 4)
    # titles_quadgrams <- filter_out(titles_quadgrams, stops)
    # titles_fivegrams <- make_ngrams(titles, 5)
    # titles_fivegrams <- filter_out(titles_fivegrams, stops)
    titles <- lapply(titles, function(x) {removeWords(x, stops)})

    subjects <- mapply(gsub, subjects, pattern = " ", replacement = "_")

    if (!is.null(taxonomy_separator)) {
      subjects <- mapply(function(x) {strsplit(x, ";")}, subjects)
      taxons <- lapply(subjects, function(y){
                                 Filter(function(x){
                                        grepl(taxonomy_separator, x)
                                        }, y)
                                 })
      subjects <- lapply(subjects, function(y){
                                   Filter(function(x){
                                          !grepl(taxonomy_separator, x)
                                          }, y)
                                   })
      taxons <- lapply(taxons, function(x){
                               lapply(
                                 strsplit(x, taxonomy_separator),
                                 function(y){
                                 tail(y, 1)
                                 })
                               })
      taxons <- lapply(taxons, function(x){paste(unlist(x), collapse = ";")})
      subjects <- lapply(subjects, function(x){paste(unlist(x), collapse = ";")})
      subjects <- mapply(paste, subjects, taxons, collapse = ";")
    }

    all_subjects <- paste(subjects, titles_bigrams, titles_trigrams, collapse = " ")
    all_subjects <- gsub(",", ";", all_subjects)
    subjectlist <- c(subjectlist, all_subjects)
  }
  nn_corpus <- Corpus(VectorSource(subjectlist))
  nn_tfidf <- TermDocumentMatrix(nn_corpus,
                                 control <- list(tokenize = SplitTokenizer,
                                                 weighting = function(x)
                                                             weightSMART(x,
                                                               spec = "ntn")))
  tfidf_top <- apply(nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);
                                                     x2[x2 >= x2[5]]
                                              })
  tfidf_top_names <- lapply(tfidf_top, names)
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {
                                             x <- gsub("_", " ", x); trim(x)})
  tfidf_top_names <- lapply(tfidf_top_names, function(x)
                                             filter_out_nested_ngrams(x, top_n))
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {
                                             paste0(
                                               toupper(
                                                 substr(x, 1, 1)),
                                               substr(x, 2, nchar(x)))
                                             })
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {
                                             paste(
                                               unlist(
                                                 trim(x)), collapse = ", ")
                                             })
  clusters$cluster_labels <- ""
  for (k in seq(1, clusters$num_clusters)) {
    group <- c(names(clusters$groups[clusters$groups == k]))
    matches <- which(clusters$labels %in% group)
    clusters$cluster_labels[c(matches)] <- tfidf_top_names[k]
  }
  return(clusters)
}

trim <- function (x) gsub("^\\s+|\\s+$", "", x)

SplitTokenizer <- function(x) {
  tokens <- unlist(
              lapply(
                strsplit(words(x), split = ";"),
                paste),
              use.names <- FALSE)
  return(tokens)
}

filter_out <- function(ngrams, stops){
  tokens <- mapply(strsplit, ngrams, split = " |;")
  tokens <- mapply(strsplit, tokens, split = "_")
  tokens <- lapply(tokens, function(y){
                           Filter(function(x){
                                    !any(grepl(x[1], c(stops)))
                                  }, y)
                           })
  tokens <- lapply(tokens, function(y){
                           Filter(function(x){
                                    !any(grepl(tail(x, 1), c(stops)))
                                  }, y)
                           })
  tokens <- lapply(tokens, function(y){
                           Filter(function(x){
                                    !(x[1] == tail(x, 1))
                                  }, y)
                           })
  tokens <- lapply(tokens, function(y){
                           Filter(function(x){
                                  length(x) > 1
                                  }, y)
                           })
  empties <- which(lapply(tokens, length) == 0)
  tokens[c(empties)] <- list("")
  tokens <- lapply(tokens, function(x){mapply(paste, x, collapse = "_")})
  tokens <- lapply(tokens, paste, collapse = ";")
  return (tokens)
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
