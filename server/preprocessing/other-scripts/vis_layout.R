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


debug <- FALSE

# Expects the following metadata fields:
# id, content, title, readers, published_in, year, authors, paper_abstract, subject

vis_layout <- function(text, metadata,
                       max_clusters=15, maxit=500, mindim=2, maxdim=2,
                       lang="english", add_stop_words=NULL,
                       testing=FALSE, taxonomy_separator=NULL, list_size=-1,
                       labeling_method = "tfidf") {

  # If list_size is greater than -1 and smaller than the actual list size,
  # deduplicate titles
  if (list_size > -1 && list_size < length(metadata$id)) {
    output <- deduplicate_titles(metadata, list_size)
    text <- subset(text, !(id %in% output))
    metadata <- subset(metadata, !(id %in% output))
    text <- head(text, list_size)
    metadata <- head(metadata, list_size)
  }

  stops <- stopwords(lang)

  if (!is.null(add_stop_words)){
    if (isTRUE(testing)) {
        add_stop_path <- paste0("../../resources/", add_stop_words, ".stop")
      } else {
        add_stop_path <- paste0("../resources/", add_stop_words, ".stop")
      }
    additional_stops <- scan(add_stop_path, what = "", sep = "\n")
    stops <- c(stops, additional_stops)
  }

  print("calc matrix")
  result <- create_tdm_matrix(metadata, text, stops);
  metadata_full_subjects <- result$metadata_full_subjects

  print("normalize matrix")
  normalized_matrix <- normalize_matrix(result$tdm_matrix);

  print("create clusters")
  clusters <- create_clusters(normalized_matrix, max_clusters = 15);
  if (labeling_method == "tfidf") {
    source("../labeling-tfidf.R")
  }
  if (labeling_method == "textrank") {
    source("../labeling-textrank.R")
  }
  named_clusters <- create_cluster_labels(clusters, metadata_full_subjects,
                                          weightingspec = "ntn", top_n = 3,
                                          stops = stops, taxonomy_separator)
  layout <- create_ordination(normalized_matrix,
                              maxit = 500, mindim = 2, maxdim = 2)
  output <- create_output(named_clusters, layout, metadata_full_subjects)

  return(output)
}

create_output <- function(clusters, layout, metadata) {

  x <- layout$X1
  y <- layout$X2
  labels <- clusters$labels
  groups <- clusters$groups
  cluster <- clusters$cluster
  num_clusters <- clusters$num_clusters
  cluster_labels <- clusters$cluster_labels

  # Prepare the output
  result <- cbind(x, y, groups, labels, cluster_labels)
  output <- merge(metadata, result, by.x = "id", by.y = "labels", all = TRUE)
  names(output)[names(output) == "groups"] <- "area_uri"
  output["area"] <- paste(output$cluster_labels, sep = "")

  output_json <- toJSON(output)

  if (debug == TRUE) {
    # Write output to file
    file_handle <- file("output_file.csv", open = "w")
    write.csv(output, file = file_handle, row.names = FALSE)
    close(file_handle)

    # Write some stats to a file
    file_handle <- file("stats.txt", open = "w")
    writeLines(c(paste("Number of Clusters:", num_clusters, sep = " ")
                 , paste("Description:", attributes(cut_off)$description)
                 , paste("Stress:", min(nm$stress), sep = " ")
                 , paste("R2:", max(nm$r2), sep = " ")
    ), file_handle)
    close(file_handle)
  }
  return(output_json)
}
