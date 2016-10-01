rm(list = ls())

library(logging)
library(tm)

options(warn=1)

wd <- getwd()

setwd("/home/chris/projects/Headstart/server/preprocessing/other-scripts/experiments") #Don't forget to set your working directory

query <- "operant learning" #args[2]
service <- "pubmed"
params <- NULL
params_file <- "../test/params_pubmed.json"

source("../vis_layout.R")
source('../pubmed.R')



plot_clusters <- function (experiment_name, cluster, num_clusters) {
  # Plot result of clustering to PDF file
  pdf(paste(experiment_name, "clustering.pdf", sep="_"), width=19, height=12)
  plot(cluster, labels=metadata$title, cex=0.6)
  rect.hclust(cluster, k=num_clusters, border="red")
  dev.off()
}

plot_layout <- function (experiment_name, layout, groups) {
  # Plot results from multidimensional scaling, highlight clusters with symbols
  pdf(paste(experiment_name, "mds.pdf", sep="_"))
  plot(layout, pch=groups)
  dev.off()
}

debug = FALSE

MAX_CLUSTERS = 15

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

#start.time <- Sys.time()
experiment_name <- paste(query, "730", sep="_")
input_data = get_papers(query, params)

#output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS)
#text, metadata, max_clusters=15, maxit=500, mindim=2, maxdim=2
text <- input_data$text
metadata <- input_data$metadata
max_clusters=MAX_CLUSTERS

print("calc matrix")
result <- create_tdm_matrix(metadata, text);
metadata_full_subjects = result$metadata_full_subjects
metadata_full_subjects_tfidf_top5 <- create_node_names(metadata_full_subjects)

print("normalize matrix")
normalized_matrix <- normalize_matrix(result$tdm_matrix);

print("create clusters")
clusters <- create_clusters(normalized_matrix, max_clusters=15);
cluster <- clusters$cluster
groups <- clusters$groups
num_clusters <- clusters$num_clusters
plot_clusters(experiment_name, cluster, num_clusters)
layout <- create_ordination(normalized_matrix, maxit=500, mindim=2, maxdim=2)
plot_layout(experiment_name, layout, groups)
output_json <- create_output(clusters, layout, metadata_full_subjects)
