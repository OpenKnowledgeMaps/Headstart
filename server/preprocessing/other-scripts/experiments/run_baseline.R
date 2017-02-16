library(jsonlite)
library(NbClust)
library(logging)
basicConfig(level='INFO')
addHandler(writeToFile, file="getting_baseline_metrics.log", level='INFO')


wd <- tryCatch(dirname(rstudioapi::getActiveDocumentContext()$path),
               error = function(e) {
                 logerror('%s', e)
                 wd <<- getwd()
               }
)
setwd(wd)
source("../vis_layout.R")

files <- list.files("baseline")

file_handle = file("baseline_results.csv", open="w")
write(paste("query", "service", "result_size", 
            "k_baseline",
            "k_silhouette", 
            "k_sdindex", 
            #"k_cindex", 
            "k_point-biserial",
            "i_silhouette", 
            "i_sdindex", 
            #"i_cindex", 
            "i_point-biserial",
            #"stress", "R2",
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
  #layout <- create_ordination(normalized_matrix, maxit=500, mindim=2, maxdim=2)
  
  
  nb1 <- NbClust(method="kmeans", index="silhouette", data = tdm_matrix, diss = normalized_matrix, distance=NULL, min.nc = 4, max.nc = 20)
  nb2 <- NbClust(method="kmeans", index="sdindex", data = tdm_matrix, diss = normalized_matrix, distance=NULL, min.nc = 4, max.nc = 20)
  #nb3 <- NbClust(method="ward.D2", index="cindex", data = tdm_matrix, diss = normalized_matrix, distance=NULL, min.nc = 4, max.nc = 20)
  nb4 <- NbClust(method="kmeans", index="ptbiserial", data = tdm_matrix, diss = normalized_matrix, distance=NULL, min.nc = 4, max.nc = 20)
  
  num_clusters = cut_off$k
  k_1 <- nb1$Best.nc[1]
  i_1 <- nb1$Best.nc[2]
  k_2 <- nb2$Best.nc[1]
  i_2 <- nb2$Best.nc[2]
  #k_3 <- nb3$Best.nc[1]
  #i_3 <- nb3$Best.nc[2]
  k_4 <- nb4$Best.nc[1]
  i_4 <- nb4$Best.nc[2]
  
  file_handle = file("baseline_results.csv", open="a")
  write(paste(query, service, nrow(text), 
              num_clusters, 
              k_1, 
              k_2, 
              #k_3, 
              k_4,
              i_1, 
              i_2, 
              #i_3, 
              i_4,
              #min(nm$stress), max(nm$r2),
              sep=","),
        file_handle)
}

for (file in files) {
  loginfo('Evaluating %s', file)
  tryCatch(get_metrics(file),
           error = function(e) {logerror('%s %s', file, e)}
  )
} 
  
