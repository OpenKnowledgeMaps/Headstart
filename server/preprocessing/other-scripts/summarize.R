vslog <- getLogger('vis.summarize')

SplitTokenizer <- function(x) {
  tokens = unlist(lapply(strsplit(words(x), split=";"), paste), use.names = FALSE)
  return(tokens)
}

trim <- function (x) gsub("^\\s+|\\s+$", "", x)


filter_out <- function(ngrams, stops){
  tokens = mapply(strsplit, ngrams, split=" |;")
  tokens = mapply(strsplit, tokens, split="_")
  tokens = lapply(tokens, function(y){
                          Filter(function(x){
                                      !any(grepl(x[1], c(stops)))
                                            }, y)})
  tokens = lapply(tokens, function(y){
                          Filter(function(x){
                                      !any(grepl(tail(x,1), c(stops)))
                                            }, y)})
  tokens = lapply(tokens, function(y){
                          Filter(function(x){
                                      !(x[1]==tail(x,1))
                                        }, y)})
  tokens = lapply(tokens, function(y){Filter(function(x){length(x)>1},y)})
  empties = which(lapply(tokens, length)==0)
  tokens[c(empties)] = list("")
  tokens = lapply(tokens, function(x){mapply(paste, x, collapse="_")})
  tokens = lapply(tokens, paste, collapse=";")
  return (tokens)
}

create_cluster_labels <- function(clusters, metadata, weightingspec,
                                  top_n, stops, taxonomy_separator="/") {
  nn_corpus <- get_clustered_corpus(clusters, metadata, stops, taxonomy_separator)
  nn_tfidf <- TermDocumentMatrix(nn_corpus, control = list(tokenize = SplitTokenizer,
                                                           weighting = function(x) weightSMART(x, spec="ntn"),
                                                           bounds = list(local = c(2, Inf))
                                                           ))
  tfidf_top <- apply(nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>0]})
  empty_tfidf <- which(apply(nn_tfidf, 2, sum)==0)
  tfidf_top[c(empty_tfidf)] <- fill_empty_clusters(nn_tfidf, nn_corpus)[c(empty_tfidf)]
  tfidf_top_names <- get_top_names(tfidf_top, top_n)
  clusters$cluster_labels = ""
  for (k in seq(1, clusters$num_clusters)) {
    group = c(names(clusters$groups[clusters$groups == k]))
    matches = which(clusters$labels%in%group)
    clusters$cluster_labels[c(matches)] = tfidf_top_names[k]
  }
  clusters$cluster_labels <- fill_empty_areatitles(clusters$cluster_labels, metadata)
  return(clusters)
}


get_clustered_corpus <- function(clusters, metadata, stops, taxonomy_separator) {
  subjectlist = list()
  for (k in seq(1, clusters$num_clusters)) {
    group = c(names(clusters$groups[clusters$groups == k]))
    matches = which(metadata$id%in%group)
    titles =  metadata$title[c(matches)]
    subjects = metadata$subject[c(matches)]

    titles = lapply(titles, function(x) {gsub("[^[:alpha:]]", " ", x)})
    titles = lapply(titles, gsub, pattern="\\s+", replacement=" ")
    titles = lapply(titles, tolower)
    title_ngrams <- get_title_ngrams(titles, stops)
    titles = lapply(titles, function(x) {removeWords(x, stops)})

    subjects = mapply(gsub, subjects, pattern = "; ", replacement=";")
    subjects = mapply(gsub, subjects, pattern=" ", replacement="_")
    titles = mapply(gsub, titles, pattern=" ", replacement=";")

    if (!is.null(taxonomy_separator)) {
      subjects = mapply(function(x){strsplit(x, ";")}, subjects)
      taxons = lapply(subjects, function(y){Filter(function(x){grepl(taxonomy_separator, x)}, y)})
      subjects = lapply(subjects, function(y){Filter(function(x){!grepl(taxonomy_separator, x)}, y)})
      taxons = lapply(taxons, function(x){lapply(strsplit(x, taxonomy_separator), function(y){tail(y,1)})})
      taxons = lapply(taxons, function(x){paste(unlist(x), collapse=";")})
      subjects = lapply(subjects, function(x){paste(unlist(x), collapse=";")})
      subjects = mapply(paste, subjects, taxons, collapse=";")
    }
    all_subjects = paste(subjects, title_ngrams$bigrams, title_ngrams$trigrams, collapse=" ")
    all_subjects = gsub(",", ";", all_subjects)
    subjectlist = c(subjectlist, all_subjects)
  }
  nn_corpus <- Corpus(VectorSource(subjectlist))
  return(nn_corpus)
}


get_top_names <- function(tfidf_top, top_n) {
  tfidf_top_names <- lapply(tfidf_top, names)
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {x = gsub("_", " ", x); trim(x)})
  tfidf_top_names <- lapply(tfidf_top_names, function(x) filter_out_nested_ngrams(x, top_n))
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {paste0(toupper(substr(x, 1, 1)), substr(x, 2, nchar(x)))})
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {paste(unlist(trim(x)), collapse=", ")})
  return(tfidf_top_names)
}

fill_empty_clusters <- function(nn_tfidf, nn_corpus){
  replacement_nn_tfidf <- TermDocumentMatrix(nn_corpus, control = list(tokenize = SplitTokenizer,
                                                          weighting = function(x) weightSMART(x, spec="ntn"),
                                                          bounds = list(local = c(1, Inf))
                                                           ))

  replacement_tfidf_top <- apply(replacement_nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>0]})
  return(replacement_tfidf_top)
}

fill_empty_areatitles <- function(cluster_labels, metadata) {
  missing_areatitles = which(lapply(cluster_labels, function(x) {nchar(x)}) <= 1)
  replacement_areatitles = metadata$subject[missing_areatitles]
  replacement_areatitles = lapply(replacement_areatitles, function(x) {gsub(";", ", ", x)})
  replacement_areatitles <- lapply(replacement_areatitles, function(x) {paste0(toupper(substr(x, 1, 1)), substr(x, 2, nchar(x)))})
  cluster_labels[missing_areatitles] = unlist(replacement_areatitles)
  return(cluster_labels)
}

get_title_ngrams <- function(titles, stops) {
  # for ngrams: we have to collapse with "_" or else tokenizers will split ngrams again at that point and we'll be left with unigrams
  titles_bigrams = lapply(lapply(titles, function(x)unlist(lapply(ngrams(unlist(strsplit(x, split=" ")), 2), paste, collapse="_"))), paste, collapse=" ")
  titles_bigrams = filter_out(titles_bigrams, stops)
  titles_trigrams = lapply(lapply(titles, function(x)unlist(lapply(ngrams(unlist(strsplit(x, split=" ")), 3), paste, collapse="_"))), paste, collapse=" ")
  titles_trigrams = filter_out(titles_trigrams, stops)
  #titles_quadgrams = lapply(lapply(titles, function(x)unlist(lapply(ngrams(unlist(strsplit(x, split=" ")), 4), paste, collapse="_"))), paste, collapse=" ")
  #titles_quadgrams = filter_out(titles_quadgrams, stops)
  #titles_fivegrams = lapply(lapply(titles, function(x)unlist(lapply(ngrams(unlist(strsplit(x, split=" ")), 5), paste, collapse="_"))), paste, collapse=" ")
  #titles_fivegrams = filter_out(titles_fivegrams, stops)
  return(list("bigrams" = titles_bigrams, "trigrams" = titles_trigrams))
}


filter_out_nested_ngrams <- function(top_ngrams, top_n) {
  top_names <- list()
  for (ngram in top_ngrams) {
    if (ngram == "")
      next;

    ngram_in_top_names = stringi::stri_detect_fixed(top_names, ngram)
    top_names_with_ngram = sapply(top_names, function(x)(stringi::stri_detect_fixed(ngram, x)))

    # ngram substring of any top_name, and no top_name substring of ngram -> skip ngram
    if (any(ngram_in_top_names == TRUE) && all(top_names_with_ngram == FALSE)) {}
    # ngram not substring of any top_name, but at least one top_name is a substring of ngram -> replace top_name with ngram
    else if (all(ngram_in_top_names == FALSE) && any(top_names_with_ngram == TRUE)) {
      top_names[which(top_names_with_ngram)] <- ngram
    }
    # a not substring of b, b not substring of a -> add b, next
    else if (all(ngram_in_top_names == FALSE) && all(top_names_with_ngram == FALSE)) {
      top_names <- unlist(c(top_names, ngram))
    }
  }
  return(head(unique(top_names), top_n))
}
