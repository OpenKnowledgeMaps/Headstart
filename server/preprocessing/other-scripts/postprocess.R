vpplog <- getLogger('vis.postprocess')

create_overview_output <- function(named_clusters, layout, metadata) {

  x = layout$X1
  y = layout$X2
  labels = named_clusters$labels
  num_clusters = named_clusters$num_clusters
  cluster_labels = named_clusters$cluster_labels

  # Prepare the output
  result = data.frame(cbind(x, y, labels, cluster_labels, metadata$id))
  names(result)[5] <- "id"
  unique_groups = data.frame(unique(result$cluster_labels))
  colnames(unique_groups) <- "cluster_labels"
  unique_groups$groups <- seq_along(unique_groups$cluster_labels)
  result = merge(result, unique_groups, by='cluster_labels')
  output = merge(metadata, result, by.x="id", by.y="id", all=TRUE)

  names(output)[names(output)=="groups"] <- "area_uri"
  output["area"] = paste(output$cluster_labels, sep="")

  output_json = toJSON(output)

  return(output_json)

}

create_streamgraph_output <- function(metadata) {
  output <- metadata
  output_json = toJSON(output)
  return(output_json)
}
