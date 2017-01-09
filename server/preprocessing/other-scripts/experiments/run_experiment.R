rm(list = ls())
args = commandArgs(trailingOnly=TRUE)


# query <- "operant learning" #args[1]
# service <- "pubmed" #args[2]
params <- NULL

# test if there is at least one argument: if not, return an error
# expected: query, service
if (length(args)<3) {
  stop("Three arguments must be supplied: 'query' 'service' 'weighting' # see weightingSMART for options", call.=FALSE)
} else if (length(args)==3) {
# default output file
  query <- args[1]
  service <- args[2]
  weightingspec <- args[3]
  experiment_name <- paste(query, service, weightingspec, sep="_")
}


library(tm)

options(warn=1)

wd <- getwd()
# Don't forget to set your working directory when working in Rstudio!
#setwd("your_path_to/Headstart/server/preprocessing/other-scripts/experiments")


source("../vis_layout.R")
if (service == "pubmed"){source('../pubmed.R')}
if (service == "pubmed"){params_file <- "../test/params_pubmed.json"}
if (service == "doaj"){source('../doaj.R')}
if (service == "doaj"){params_file <- "../test/params_doaj.json"}


plot_clusters <- function (experiment_name, cluster, num_clusters) {
  # Plot result of clustering to PDF file
  pdf(paste(experiment_name, "clustering.pdf", sep="_"), width=19, height=12)
  plot(cluster, labels=paste(substr(metadata$title, 0, 120), metadata_full_subjects$cluster_name, sep=" - "), cex=0.6)
  rect.hclust(cluster, k=num_clusters, border="red")
  dev.off()
}

plot_layout <- function (experiment_name, layout, groups) {
  # Plot results from multidimensional scaling, highlight clusters with symbols
  pdf(paste(experiment_name, "mds.pdf", sep="_"))
  plot(layout, pch=groups)
  dev.off()
}

write_stats <- function (clusters, layout, metadata) {
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
  output = lapply(output, as.String)
  # Write output to file
  file_handle = file(paste(experiment_name, "output_file.csv"), open="w")
  write.csv(output, file=file_handle, row.names=FALSE)
  close(file_handle)

  # Write some stats to a file
  file_handle = file(paste(experiment_name, "stats.txt"), open="w")
  writeLines(c(paste("Number of Clusters:", num_clusters, sep=" ")
               , paste("Description:", attributes(cut_off)$description)
               , paste("Stress:", min(nm$stress), sep=" ")
               , paste("R2:", max(nm$r2), sep=" ")
  ), file_handle)

  close(file_handle)
}

MAX_CLUSTERS = 15

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

#start.time <- Sys.time()
input_data = get_papers(query, params)

#output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS)
#text, metadata, max_clusters=15, maxit=500, mindim=2, maxdim=2
text <- input_data$text
metadata <- input_data$metadata
max_clusters=MAX_CLUSTERS

print("calc matrix")
result <- create_tdm_matrix(metadata, text);
metadata_full_subjects = result$metadata_full_subjects

print("normalize matrix")
normalized_matrix <- normalize_matrix(result$tdm_matrix);

print("create clusters")
clusters <- create_clusters(normalized_matrix, max_clusters=15);
print("add cluster names")
clusters_with_names <- create_cluster_names(clusters, metadata_full_subjects, weightingspec, 3)

metadata_full_subjects$cluster_name = "" # need to initialize column first?
for (k in seq(1, clusters$num_clusters)) {
  group = c(names(clusters$groups[clusters$groups == k]))
  matches = which(metadata_full_subjects$id%in%group)
  metadata_full_subjects$cluster_name[c(matches)] = paste(unlist(clusters_with_names$cluster_names[k]), collapse=", ")
}

cluster <- clusters$cluster
groups <- clusters$groups
num_clusters <- clusters$num_clusters
plot_clusters(experiment_name, cluster, num_clusters)
layout <- create_ordination(normalized_matrix, maxit=500, mindim=2, maxdim=2)
plot_layout(experiment_name, layout, groups)
# write_stats(clusters, layout, metadata_full_subjects)
output_json <- create_output(clusters, layout, metadata_full_subjects)
