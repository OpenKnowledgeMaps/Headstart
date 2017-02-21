library(GMD)
library(MASS)
library(ecodist)
library(tm)
library(proxy)
library(SnowballC)
library(jsonlite)
library(parfossil)
library(doParallel)
registerDoParallel(3)

debug = FALSE

# Expects the following metadata fields:
# id, content, title, readers, published_in, year, authors, paper_abstract, subject

vis_layout <- function(text, metadata, max_clusters=15, maxit=500, mindim=2, maxdim=2) {
  print("calc matrix")
  result <- create_tdm_matrix(metadata, text);
  metadata_full_subjects = result$metadata_full_subjects
  metadata_full_subjects_tfidf_top5 <- create_node_names(metadata_full_subjects)

  print("normalize matrix")
  normalized_matrix <- normalize_matrix(result$tdm_matrix);

  print("create clusters")
  clusters <- create_clusters(normalized_matrix, max_clusters=15);
  layout <- create_ordination(normalized_matrix, maxit=500, mindim=2, maxdim=2)
  output <- create_output(clusters, layout, metadata_full_subjects)

  return(output)

}

create_tdm_matrix <- function(metadata, text, sparsity=1, lang="english") {
  m <- list(content = "content", id = "id")

  myReader <- readTabular(mapping = m)

  (corpus <- Corpus(DataframeSource(text), readerControl = list(reader = myReader)))

  corpus <- tm_map(corpus, removePunctuation)

  corpus <- tm_map(corpus, removeWords, stopwords(lang))

  corpus <- tm_map(corpus, stripWhitespace)

  metadata_full_subjects <- replace_keywords_if_empty(corpus, metadata)

  # corpus <- tm_map(corpus, content_transformer(tolower))

  corpus_unstemmed = corpus

  corpus <- tm_map(corpus, stemDocument)

  tdm <- TermDocumentMatrix(corpus)

  if(sparsity < 1) {
    tdm <- removeSparseTerms(tdm, sparsity)
  }

  tdm_matrix = t(as.matrix(tdm))

  return(list(tdm_matrix = tdm_matrix, metadata_full_subjects = metadata_full_subjects))
}

BigramTokenizer <- function(x) unlist(lapply(ngrams(words(x), 2), paste, collapse = " "), use.names = FALSE)

TrigramTokenizer <- function(x) unlist(lapply(ngrams(words(x), 3), paste, collapse = " "), use.names = FALSE)

replace_keywords_if_empty <- function(corpus, metadata) {

  missing_subjects = which(lapply(metadata$subject, function(x) {nchar(x)}) <= 1)

  candidates = mapply(paste, metadata$title[missing_subjects], metadata$paper_abstract[missing_subjects])
  candidates = lapply(candidates, function(x)paste(removeWords(x, stopwords('english')), collapse=""))
  candidates = lapply(candidates, function(x)paste(unlist(strsplit(x, split="  ")), collapse=" "))
  candidates_bigrams = lapply(lapply(candidates, function(x)unlist(lapply(ngrams(unlist(strsplit(x, split=" ")), 2), paste, collapse="_"))), paste, collapse=" ")
  candidates = mapply(paste, candidates, candidates_bigrams)
  candidates = lappy(candidates, function(x) {gsub('\\b\\d+\\s','', x)})

  nn_corpus <- Corpus(VectorSource(candidates))
  nn_tfidf <- TermDocumentMatrix(nn_corpus, control = list(tokenize = SplitTokenizer, weighting = function(x) weightSMART(x, spec="ntn")))
  tfidf_top <- apply(nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>=x2[3]]})
  tfidf_top_names <- lapply(tfidf_top, names)
  replacement_keywords <- lapply(tfidf_top_names, FUN = function(x) {paste(unlist(x), collapse="; ")})
  replacement_keywords <- gsub("_", " ", replacement_keywords)

  metadata$subject[missing_subjects] <- replacement_keywords

  return(metadata)

}

normalize_matrix <- function(tdm_matrix, method = "cosine") {
  distance_matrix_2 <- as.matrix(proxy::dist(tdm_matrix, method))
  distance_matrix = as.dist(distance_matrix_2)

  return(distance_matrix)
}

create_clusters <- function(distance_matrix, max_clusters=-1, method="ward.D") {
  # Perform clustering, use elbow to determine a good number of clusters
  css_cluster <- css.hclust(distance_matrix, hclust.FUN.MoreArgs=list(method="ward.D"))
  cut_off <<- elbow.batch(css_cluster)

  num_clusters = cut_off$k

  if(max_clusters > -1 && num_clusters > max_clusters) {
    num_clusters = MAX_CLUSTERS
  }

  meta_cluster = attr(css_cluster,"meta")
  cluster = meta_cluster$hclust.obj
  labels = labels(distance_matrix)
  groups <- cutree(cluster, k=num_clusters)

  if(debug == TRUE) {
    # Plot result of clustering to PDF file
    pdf("clustering.pdf", width=19, height=12)
    plot(cluster, labels=metadata$title, cex=0.6)
    rect.hclust(cluster, k=num_clusters, border="red")
    dev.off()
  }

  clusters = list("labels"=labels, "cluster"=cluster, "groups"=groups, "num_clusters"=num_clusters)
  return(clusters)

}

create_ordination <- function(distance_matrix, mindim=2, maxdim=2, maxit=500) {

  # Perform non-metric multidimensional scaling
  nm <<- par.nmds(distance_matrix, mindim=mindim, maxdim=maxdim, maxit=maxit)
  nm.nmin = nmds.min(nm)

  if(debug == TRUE) {
    # Plot results from multidimensional scaling, highlight clusters with symbols
    pdf("mds.pdf")
    plot(nm.nmin, pch=groups)
    dev.off()
  }

  return(nm.nmin)
}


SplitTokenizer <- function(x) {
  tokens = unlist(lapply(strsplit(words(x), split=";"), paste), use.names = FALSE)
  return(tokens)
}


create_cluster_names <- function(clusters, metadata_full_subjects, weightingspec, top_n) {
  subjectlist = list()
  for (k in seq(1, clusters$num_clusters)) {
    group = c(names(clusters$groups[clusters$groups == k]))
    matches = which(metadata_full_subjects$id%in%group)

    titles =  metadata_full_subjects$title[c(matches)]
    subjects = metadata_full_subjects$subject[c(matches)]
    texts = mapply(paste, titles, subjects)
    texts = lapply(texts, function(x) {gsub("[^[:alnum:]]", " ", x)})

    texts = lapply(texts, function(x)paste(removeWords(x, stopwords('english')), collapse=""))
    texts = lapply(texts, function(x)paste(unlist(strsplit(x, split="  ")), collapse=" "))

    # for ngrams: we have to collapse with "_" or else tokenizers will split ngrams again at that point and we'll be left with unigrams
    texts_bigrams = lapply(lapply(texts, function(x)unlist(lapply(ngrams(unlist(strsplit(x, split=" ")), 2), paste, collapse="_"))), paste, collapse=" ")
    texts_trigrams = lapply(lapply(texts, function(x)unlist(lapply(ngrams(unlist(strsplit(x, split=" ")), 3), paste, collapse="_"))), paste, collapse=" ")

    subjects = paste(metadata_full_subjects$subject[c(matches)], texts_bigrams, texts_trigrams, collapse=" ")
    subjects = gsub(",", ";", subjects)
    subjectlist = c(subjectlist, subjects)
  }
  nn_corpus <- Corpus(VectorSource(subjectlist))
  nn_corpus <- tm_map(nn_corpus, removeWords, stopwords("english"))
  nn_tfidf <- TermDocumentMatrix(nn_corpus, control = list(tokenize = SplitTokenizer, weighting = function(x) weightSMART(x, spec=weightingspec)))
  tfidf_top <- apply(nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>=x2[3]]})
  tfidf_top_names <- lapply(tfidf_top, names)
  tfidf_top_names <- lapply(tfidf_top_names, function(x) filter_out_nested_ngrams(x, top_n))
  tfidf_top_names <- lapply(tfidf_top_names, function(x) {gsub("_", " ", x)})
  clusters$cluster_names <- tfidf_top_names
  return(clusters)
}

filter_out_nested_ngrams <- function(top_ngrams, top_n) {
  top_names <- list()
  for (ngram in top_ngrams) {
    ngram_in_top_names = grepl(ngram, top_names)
    top_names_with_ngram = sapply(top_names, function(x)(grepl(x, ngram)))
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


create_output <- function(clusters, layout, metadata) {

  x = layout$X1
  y = layout$X2
  labels = clusters$labels
  groups = clusters$groups
  cluster = clusters$cluster
  num_clusters = clusters$num_clusters

  # Prepare the output
  result = cbind(x,y,groups,labels)
  output = merge(metadata, result, by.x="id", by.y="labels", all=TRUE)
  names(output)[names(output)=="groups"] <- "area_uri"
  output["area"] = paste("Cluster ", output$area_uri, sep="")

  output_json = toJSON(output)

  if(debug == TRUE) {
    # Write output to file
    file_handle = file("output_file.csv", open="w")
    write.csv(output, file=file_handle, row.names=FALSE)
    close(file_handle)

    # Write some stats to a file
    file_handle = file("stats.txt", open="w")
    writeLines(c(paste("Number of Clusters:", num_clusters, sep=" ")
                 , paste("Description:", attributes(cut_off)$description)
                 , paste("Stress:", min(nm$stress), sep=" ")
                 , paste("R2:", max(nm$r2), sep=" ")
    ), file_handle)

    close(file_handle)
  }

  return(output_json)

}
