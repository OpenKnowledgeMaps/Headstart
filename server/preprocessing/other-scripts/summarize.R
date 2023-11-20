library(stringr)
vslog <- getLogger('vis.summarize')

SplitTokenizer <- function(x) {
  tokens = unlist(lapply(strsplit(words(x), split=";"), paste), use.names = FALSE)
  return(tokens)
}

trim <- function (x) gsub("^\\s+|\\s+$", "", x)


expand_ngrams <- function(text, n) {
  text <- trimws(text)
  lapply(lapply(text, function(x)unlist(lapply(ngrams(unlist(strsplit(x, split = " ")), n), paste, collapse  = "_"))), paste, collapse = " ")
}

prune_ngrams <- function(ngrams, stops){
  ngrams = mapply(strsplit, ngrams, split=" |;")
  tokenized_ngrams = mapply(function(x) {
                            strsplit(x, split="_")
                          }, ngrams)
  # filter out empty tokens
  tokenized_ngrams = lapply(tokenized_ngrams, function(ngrams){ngrams[lapply(ngrams, length)>0]})
  # remove ngrams starting with a stopword
  batch_size <- 1000
  total_length <- length(stops)
  for (i in seq(1, total_length, batch_size)) {
    tokenized_ngrams = lapply(tokenized_ngrams, function(x) {
                              Filter(function(tokens){
                                !any(stri_detect_fixed(stops[i:min(i+batch_size -1, total_length)], tolower(tokens[[1]])))
                              }, x)})
    # remove ngrams ending with a stopword
    tokenized_ngrams = lapply(tokenized_ngrams, function(x) {
                              Filter(function(tokens){
                                !any(stri_detect_fixed(stops[i:min(i+batch_size -1, total_length)], tolower(tail(tokens,1))))
                              }, x)})
  }
  # remove ngrams starting and ending with the same word
  tokenized_ngrams = lapply(tokenized_ngrams, function(x) {
                            Filter(function(tokens){
                              !(tokens[[1]]==tail(tokens,1))
                            }, x)})
  # keep ngrams with min length 2
  tokenized_ngrams = lapply(tokenized_ngrams, function(x){x[lapply(x, length)>1]})
  tokenized_ngrams = tokenized_ngrams[lapply(tokenized_ngrams, length)>1]
  tokenized_ngrams = lapply(tokenized_ngrams, function(x){mapply(paste, x, collapse="_")})
  pruned_ngrams = lapply(tokenized_ngrams, paste, collapse=";")
  return (pruned_ngrams)
}

create_cluster_labels <- function(clusters, metadata,
                                  type_counts,
                                  weightingspec,
                                  top_n, stops, taxonomy_separator="/",
                                  params=NULL) {
  cc <- params$custom_clustering
  if (!(is.null(cc)) && (cc %in% names(metadata))) {
    nn_corpus <- get_custom_cluster_corpus(clusters, metadata, stops, taxonomy_separator, custom_clustering=cc)
  } else {
    nn_corpus <- get_cluster_corpus(clusters, metadata, stops, taxonomy_separator)
  }
  nn_tfidf <- TermDocumentMatrix(nn_corpus, control = list(
    tokenize = SplitTokenizer,
    weighting = function(x) weightSMART(x, spec="ntn"),
    bounds = list(local = c(2, Inf)),
    tolower = TRUE
  ))
  tfidf_top <- apply(nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>0]})
  empty_tfidf <- which(apply(nn_tfidf, 2, sum)==0)
  tfidf_top[c(empty_tfidf)] <- fill_empty_clusters(nn_tfidf, nn_corpus)[c(empty_tfidf)]
  tfidf_top_names <- get_top_names(tfidf_top, top_n, stops)
  clusters$cluster_labels = ""
  batch_size <- 1000
  total_length <- length(stops)
  for (k in seq(1, clusters$num_clusters)) {
    matches = which(unname(clusters$groups == k) == TRUE)
    summary = tfidf_top_names[[k]]
    if (summary == "") {
      candidates = mapply(paste, metadata$title[matches], metadata$paper_abstract[matches])
      candidates = lapply(candidates, tolower)
      for (i in seq(1, total_length, batch_size)) {
        candidates = lapply(candidates, function(x) {paste(removeWords(x, stops[i:min(i+batch_size -1, total_length)]), collapse="")})
      }
      candidates = lapply(candidates, function(x) {gsub("[^[:alpha:]]", " ", x)})
      candidates = lapply(candidates, function(x) {gsub(" +", " ", x)})
      candidates_bigrams = lapply(lapply(candidates, expand_ngrams, n=2), paste, collapse=" ")
      candidates_trigrams = lapply(lapply(candidates, expand_ngrams, n=3), paste, collapse=" ")
      candidates = unname(mapply(paste, candidates_bigrams, candidates_trigrams))
      candidates =  unlist(lapply(candidates, str_split, " "), recursive = F)
      candidates = unlist(lapply(candidates, function(x) {another_prune_ngrams(x, stops)}))
      top_ngrams = sort(table(strsplit(paste(candidates, collapse=" "), " ")), decreasing = T)
      summary <- filter_out_nested_ngrams(names(top_ngrams), 3)
      summary = lapply(summary, FUN = function(x) {paste(unlist(x), collapse="; ")})
      summary = gsub("_", " ", summary)
      summary = paste(summary, collapse=", ")
    }
    clusters$cluster_labels[c(matches)] = summary
  }
  if (!(is.null(cc)) && (cc %in% names(metadata$annotations))) {
    clusters$cluster_labels = metadata$annotations[[cc]]
  }
  clusters$cluster_labels <- fix_cluster_labels(clusters$cluster_labels, type_counts)
  return(clusters)
}


fix_cluster_labels <- function(clusterlabels, type_counts){
  unlist(mclapply(clusterlabels, function(x) {
    x <- fix_keyword_casing(x, type_counts)
    # clean up titles from format issues
    x <- gsub(",+", ",", x)
    }))
}

fix_keyword_casing <- function(keyword, type_counts) {
  kw = strsplit(keyword, ", ")
  kw = lapply(kw, strsplit, " ")[[1]]
  kw = lapply(kw, function(x){lapply(x, match_keyword_case, type_counts=type_counts)})
  kw = lapply(kw, paste, collapse = " ")
  kw = lapply(kw, function(x) {paste0(toupper(substr(x, 1, 1)), substr(x, 2, nchar(x)))})
  kw = paste(kw, collapse = ", ")
  return(paste(kw, collapse = ", "))
}

match_keyword_case <- function(x, type_counts) {
  y <- names(type_counts[which(tolower(names(type_counts)) == gsub("-", "", tolower(x)))][1])
  if (!is.na(y)) return(y) else return(x)
}

get_custom_cluster_corpus <- function(clusters, metadata, stops, taxonomy_separator,
                               add_title_ngrams = T, custom_clustering=NULL) {
  subjectlist = list()
  for (k in seq(1, clusters$num_clusters)) {
    matches = which(unname(clusters$groups == k) == TRUE)
    custom_input = metadata[[custom_clustering]][matches]
    batch_size <- 1000
    total_length <- length(stops)
    for (i in seq(1, total_length, batch_size)) {
      custom_input = lapply(custom_input, function(x) {removeWords(x, stops[i:min(i+batch_size -1, total_length)])})
    }
    custom_input = mapply(gsub, custom_input, pattern = "; ", replacement=";")
    custom_input = mapply(gsub, custom_input, pattern=" ", replacement="_")

    all_subjects = paste(custom_input, collapse=" ")
    all_subjects <- str_replace_all(all_subjects, "\\?+_\\?+|\\?+|\\?+ ", "")
    all_subjects <- str_replace_all(all_subjects, ";+", ";")
    all_subjects <- str_replace_all(all_subjects, " ?; ?", ";")
    all_subjects <- str_replace_all(all_subjects, " +", ";")
    subjectlist = c(subjectlist, all_subjects)
  }
  nn_corpus <- VCorpus(VectorSource(subjectlist))
  return(nn_corpus)
}

get_cluster_corpus <- function(clusters, metadata, stops, taxonomy_separator,
                               add_title_ngrams = T, custom_clustering=NULL) {
  subjectlist = list()
  for (k in seq(1, clusters$num_clusters)) {
    matches = which(unname(clusters$groups == k) == TRUE)
    titles =  metadata$title[matches]
    subjects = metadata$subject[matches]
    titles = lapply(titles, function(x) {gsub("[^[:alnum:]-]", " ", x)})
    titles = lapply(titles, gsub, pattern="\\s+", replacement=" ")
    title_ngrams <- get_title_ngrams(titles, stops, c(2, 3))
    batch_size <- 1000
    total_length <- length(stops)
    for (i in seq(1, total_length, batch_size)) {
      titles = lapply(titles, function(x) {removeWords(x, stops[i:min(i+batch_size -1, total_length)])})
    }
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
    if (add_title_ngrams == T) {
      all_subjects = paste(subjects, title_ngrams, collapse=" ")
    } else {
      all_subjects = paste(subjects, collapse=" ")
    }
    all_subjects <- str_replace_all(all_subjects, "\\?+_\\?+|\\?+|\\?+ ", "")
    all_subjects <- str_replace_all(all_subjects, ";+", ";")
    all_subjects <- str_replace_all(all_subjects, " ?; ?", ";")
    all_subjects <- str_replace_all(all_subjects, " +", ";")
    subjectlist = c(subjectlist, all_subjects)
  }
  nn_corpus <- VCorpus(VectorSource(subjectlist))
  return(nn_corpus)
}


get_top_names <- function(tfidf_top, top_n, stops) {
  tfidf_top_names <- lapply(tfidf_top, names)
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {another_prune_ngrams(x, stops)})
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {x = gsub("_", " ", x); trim(x)})
  tfidf_top_names <- lapply(tfidf_top_names, function(x) filter_out_nested_ngrams(x, top_n))
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {paste0(toupper(substr(x, 1, 1)), substr(x, 2, nchar(x)))})
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {paste(unlist(trim(x)), collapse=", ")})
  return(tfidf_top_names)
}

another_prune_ngrams <- function(ngrams, stops){
  # filter out stopwords from start or stop of ngrams
  tokens <- unname(unlist(ngrams))
  # split ngrams
  tokens = lapply(tokens, strsplit, split="_")
  tokens = tokens[lapply(tokens, length)>0]
  # check if first token of ngrams in stopword list
  batch_size <- 1000
  total_length <- length(stops)
  for (i in seq(1, total_length, batch_size)) try({
    tokens = lapply(tokens, function(y){
                            Filter(function(x){
                                    if (x[1] != "") !any(stri_detect_fixed(stops[i:min(i+batch_size -1, total_length)], x[1]))
                                              }, y)})
    # check if last token of ngrams in stopword list
    tokens = lapply(tokens, function(y){
                            Filter(function(x){
                                    if (tail(x,1) != "") !any(stri_detect_fixed(stops[i:min(i+batch_size -1, total_length)], tail(x,1)))
                                              }, y)})
  })
  # check that first token is not the same as the last token
  tokens = lapply(tokens, function(y){
                    if(length(y) > 1) {
                          Filter(function(x){
                                      !(x[1]==tail(x,1))
                          }, y)}
                    else y})
  tokens = lapply(tokens, function(y){Filter(function(x){length(x)>=1},y)})
  keep = which(lapply(tokens, length)!=0)
  tokens = tokens[keep]
  tokens = lapply(tokens, function(x){mapply(paste, x, collapse="_")})
  return(tokens)
}

fill_empty_clusters <- function(nn_tfidf, nn_corpus){
  replacement_nn_tfidf <- TermDocumentMatrix(nn_corpus, control = list(tokenize = SplitTokenizer,
                                                          weighting = function(x) weightSMART(x, spec="ntn"),
                                                          bounds = list(local = c(1, Inf))
                                                           ))
  replacement_tfidf_top <- apply(replacement_nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>0]})
  return(replacement_tfidf_top)
}


get_title_ngrams <- function(titles, stops, ngram_lengths) {
  # for ngrams: we have to collapse with "_" or else tokenizers will split ngrams again at that point and we'll be left with unigrams
  titles_bigrams = prune_ngrams(expand_ngrams(titles, 2), stops)
  titles_trigrams = prune_ngrams(expand_ngrams(titles, 3), stops)
  return(c(titles_bigrams, titles_trigrams))
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

