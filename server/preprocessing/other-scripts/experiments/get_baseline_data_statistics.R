library(jsonlite)
library(logging)
library(Matrix)
basicConfig(level='INFO')
addHandler(writeToFile, file="getting_baseline_metrics.log", level='INFO')

files <- list.files("baseline")

wd <- tryCatch(dirname(rstudioapi::getActiveDocumentContext()$path),
               error = function(e) {
                 logerror('%s', e)
                 wd <<- getwd()
               }
)
setwd(wd)
source("../vis_layout.R")


headers_d = paste(names(fromJSON(paste("baseline/",files[1], sep=""))$metadata), collapse=",")
headers_p = paste(names(fromJSON(paste("baseline/",files[1100], sep=""))$metadata), collapse=",")
file_handle = file("baseline_data_statistics_doaj.csv", open="w")
write(paste("query", "service", "result_size", 
            "k_baseline",
            "stress", "R2",
            "tdm_sparsity", "norm_sparsity", 
            headers_d,
            sep=","),
      file_handle)
file_handle = file("baseline_data_statistics_pubmed.csv", open="w")
write(paste("query", "service", "result_size", 
            "k_baseline",
            "stress", "R2",
            "tdm_sparsity", "norm_sparsity", 
            headers_p,
            sep=","),
      file_handle)

MAX_CLUSTERS = 15
get_metrics <- function(file) {
  service = unlist(strsplit(file, "_"))[2]
  query = unlist(strsplit(file, "_"))[3]
  input_data = fromJSON(paste("baseline/",file, sep=""))
  text <- input_data$text
  metadata <- input_data$metadata
  nans <- apply(apply(metadata, 2, is.na), 2, sum)
  
  result <- create_tdm_matrix(metadata, text)
  tdm_matrix <- result$tdm_matrix
  tdm_sparsity <- nnzero(tdm_matrix) / (dim(tdm_matrix)[1] * dim(tdm_matrix)[2])
  normalized_matrix <- normalize_matrix(tdm_matrix)
  norm_sparsity <- nnzero(normalized_matrix) / (dim(normalized_matrix)[1] * dim(normalized_matrix)[2])
  
  clusters <- create_clusters(normalized_matrix, max_clusters=15)
  layout <- create_ordination(normalized_matrix, maxit=500, mindim=2, maxdim=2)

  file_handle = file(paste("baseline_data_statistics_", service, ".csv", sep=""), open="a")
  
  num_clusters = cut_off$k
  
  
  write(paste(query, service, nrow(text), 
              num_clusters, 
              min(nm$stress), max(nm$r2),
              tdm_sparsity, norm_sparsity,
              paste(nans, sep=",", collapse=","),
              sep=","),
        file_handle)
}

for (file in files) {
  loginfo('Evaluating %s', file)
  tryCatch(get_metrics(file),
           error = function(e) {logerror('%s %s', file, e)}
  )
} 
