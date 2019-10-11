vpplog <- getLogger('vis.postprocess')

create_overview_output <- function(named_clusters, layout, metadata) {

  x = layout$X1
  y = layout$X2
  labels = named_clusters$labels
  cluster = named_clusters$cluster
  num_clusters = named_clusters$num_clusters
  cluster_labels = named_clusters$cluster_labels

  # Prepare the output
  result = data.frame(cbind(x, y, labels, cluster_labels))
  unique_groups = data.frame(unique(result$cluster_labels))
  colnames(unique_groups) <- "cluster_labels"
  unique_groups$groups <- seq_along(unique_groups$cluster_labels)
  result = merge(result, unique_groups, by='cluster_labels')
  output = merge(metadata, result, by.x="id", by.y="labels", all=TRUE)

  names(output)[names(output)=="groups"] <- "area_uri"
  output["area"] = paste(output$cluster_labels, sep="")

  output_json = toJSON(output)

  if(exists("DEBUG") && DEBUG == TRUE) {
    library(ggplot2)
    # Plot results from multidimensional scaling, highlight clusters with symbols
    temp <- fromJSON(output_json)
    temp$x <- as.numeric(temp$x)
    temp$y <- as.numeric(temp$y)
    temp$title <- unlist(lapply(temp$title, substr, start=0, stop=15))
    g <- ggplot(temp, aes(x, y, label=title)) +
          geom_point(aes(colour=area_uri)) +
          geom_text(size=2)
    ggsave(file = "debug_nmds.svg", plot = g, width = 15, height = 15)
  }

  # NEEDS FIX
  # if(exists("DEBUG") && DEBUG == TRUE) {
  #   # Write output to file
  #   file_handle = file("output_file.csv", open="w")
  #   write.csv(output, file=file_handle, row.names=FALSE)
  #   close(file_handle)
  # }

  return(output_json)

}

create_streamgraph_output <- function(metadata) {
  output <- metadata
  output_json = toJSON(output)
  return(output_json)
}
