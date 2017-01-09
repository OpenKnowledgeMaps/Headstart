library(jsonlite)
library(NbClust)
library(logging)
basicConfig(level='INFO')
addHandler(writeToFile, file="getting_baseline_metrics.log", level='INFO')


setwd("/home/chris/projects/Headstart/server/preprocessing/other-scripts/experiments/")

source("../vis_layout.R")

files <- list.files("baseline")

file_handle = file("baseline_results.csv", open="w")
write(paste("query", "service", "result_size", 
            "k","k_silhouette", "silhouette", "k_dunn", "dunn",
            "stress", "R2",
            sep=","),
      file_handle)

MAX_CLUSTERS = 15


get_metrics <- function(file) {
  service = unlist(strsplit(file, "_"))[2]
  query = unlist(strsplit(file, "_"))[3]
  input_data = fromJSON(paste("baseline/",file, sep=""))
  text <- input_data$text
  metadata <- input_data$metadata
  result <- create_tdm_matrix(metadata, text)
  tdm_matrix <- result$tdm_matrix
  normalized_matrix <- normalize_matrix(tdm_matrix)
  clusters <- create_clusters(normalized_matrix, max_clusters=15)
  layout <- create_ordination(normalized_matrix, maxit=500, mindim=2, maxdim=2)
  
  num_clusters = cut_off$k
  nb <- NbClust(data = tdm_matrix, distance="euclidean", min.nc = 2, max.nc = 20, method="ward.D", index="silhouette")
  k_silhouette <- nb$Best.nc[1]
  silhouette <- nb$Best.nc[2]
  nb <- NbClust(data = tdm_matrix, distance="euclidean", min.nc = 2, max.nc = 20, method="ward.D", index="dunn")
  k_dunn <- nb$Best.nc[1]
  dunn <- nb$Best.nc[2]
  
  file_handle = file("baseline_results.csv", open="a")
  write(paste(query, service, nrow(text), 
              num_clusters, k_silhouette, silhouette, k_dunn, dunn,
              min(nm$stress), max(nm$r2),
              sep=","),
        file_handle)
}

for (file in files) {
  tryCatch(get_metrics(file),
           error = function(e) {logerror('%s %s', e, file)}
  )
} 
  
