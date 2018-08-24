library(GMD)
library(MASS)
library(ecodist)
library(tm)
library(proxy)
library(SnowballC)
library(jsonlite)
library(parfossil)
library(doParallel)
library(stringi)
library(stringdist)
registerDoParallel(3)


debug = FALSE

# Expects the following metadata fields:
# id, content, title, readers, published_in, year, authors, paper_abstract, subject

vis_layout <- function(text, metadata, max_clusters=15, maxit=500, mindim=2, maxdim=2, lang="english",
                       add_stop_words=NULL, testing=FALSE, taxonomy_separator=NULL, list_size=-1) {


  tryCatch({
   if(!isTRUE(testing)) {
     source('utils.R')
     source('preprocess.R')
     source('cluster.R')
     source('summarize.R')
     source('postprocess.R')
   } else {
     source('../utils.R')
     source('../preprocess.R')
     source('../cluster.R')
     source('../summarize.R')
     source('../postprocess.R')
   }
  }, error = function(err) print(err)
  )
  filtered <- filter_duplicates(metadata, text, list_size)
  metadata <- filtered$metadata
  text <- filtered$text

  stops <- get_stopwords(lang, add_stop_words, testing)

  print("calc matrix")
  res <- create_corpus(metadata, text, stops)
  corpus <- res$corpus
  corpus_unstemmed <- res$corpus_unstemmed
  metadata_full_subjects = replace_keywords_if_empty(corpus, metadata, stops)
  tdm_matrix <- create_tdm_matrix(corpus)

  print("normalize matrix")
  normalized_matrix <- normalize_matrix(tdm_matrix);

  print("create clusters")
  clusters <- create_clusters(normalized_matrix, max_clusters=max_clusters);
  named_clusters <- create_cluster_labels(clusters, metadata_full_subjects, weightingspec="ntn", top_n=3, stops=stops, taxonomy_separator)
  layout <- create_ordination(normalized_matrix, maxit=500, mindim=2, maxdim=2)
  output <- create_output(named_clusters, layout, metadata_full_subjects)

  return(output)

}
