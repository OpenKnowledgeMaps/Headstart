vpplog <- getLogger('vis.postprocess')

create_output <- function(clusters, layout, metadata) {

  x = layout$X1
  y = layout$X2
  labels = clusters$labels
  groups = clusters$groups
  cluster = clusters$cluster
  num_clusters = clusters$num_clusters
  cluster_labels = clusters$cluster_labels

  # Prepare the output
  result = cbind(x,y,groups,labels, cluster_labels)
  output = merge(metadata, result, by.x="id", by.y="labels", all=TRUE)

  names(output)[names(output)=="groups"] <- "area_uri"
  output["area"] = paste(output$cluster_labels, sep="")
  missing_areatitles = which(lapply(output$area, function(x) {nchar(x)}) <= 1)
  replacement_areatitles = output$subject[missing_areatitles]
  replacement_areatitles = lapply(replacement_areatitles, function(x) {gsub(";", ", ", x)})
  replacement_areatitles <- lapply(replacement_areatitles, function(x) {paste0(toupper(substr(x, 1, 1)), substr(x, 2, nchar(x)))})
  output$area[missing_areatitles] = unlist(replacement_areatitles)

  output_json = toJSON(output)

  if(exists("DEBUG") && DEBUG == TRUE) {
    # Write output to file
    file_handle = file("output_file.csv", open="w")
    write.csv(output, file=file_handle, row.names=FALSE)
    close(file_handle)
  }

  return(output_json)

}
