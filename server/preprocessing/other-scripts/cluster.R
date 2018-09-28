vclog <- getLogger('vis.cluster')

get_cut_off <- function(css_cluster, attempt=1){
  evthres = 0.9**attempt
  incthres = 1 - (0.9**attempt)
  vclog$debug(paste("ev.thres:", evthres, "inc.thres:", incthres))
  cut_off <- elbow(css_cluster, ev.thres = evthres, inc.thres = incthres)
  return (cut_off)
}

create_clusters <- function(distance_matrix, max_clusters=-1, method="ward.D") {
  if(nrow(distance_matrix) <= 2){
    stop("Not enough papers for clustering, N <= 2.")
  }
  # Perform clustering, use elbow to determine a good number of clusters
  css_cluster <- css.hclust(distance_matrix, hclust.FUN.MoreArgs=list(method="ward.D"))
  num_clusters <- NA
  num_clusters <-tryCatch({
    cut_off <- elbow.batch(css_cluster)
    num_clusters <- cut_off$k
  }, error = function(err){
    vclog$warn(err)
    return (NA)
  })
  attempt <- 1
  while(is.na(num_clusters)){
    num_clusters <- tryCatch({
      cut_off <- get_cut_off(css_cluster, attempt)
      attempt <- attempt+1
      cut_off$k
    }, error = function(err){
      vclog$warn(err)
      return (NA)
      }
    )
  }

  num_items = nrow(distance_matrix)

  if(!is.null(num_clusters) && max_clusters > -1 && num_clusters > max_clusters) {
    num_clusters = MAX_CLUSTERS

    if(num_items >= 150) {
      vclog$warn("High content number, increasing max_k.")
      if(num_items >= 150 && num_items < 200) {
        num_clusters = 16
      } else if (num_items >= 200 && num_items < 300) {
        num_clusters = 17
      } else if (num_items >= 300 && num_items < 400) {
        num_clusters = 18
      } else if (num_items >= 400 && num_items < 500) {
        num_clusters = 19
      } else if (num_items >= 500) {
        num_clusters = 20
      }
    }
  }

  if(num_items <= 30){
    vclog$warn("Low content number, lowering max_k.")
    num_clusters = round(sqrt(nrow(distance_matrix))) + 1
  }

  meta_cluster = attr(css_cluster,"meta")
  cluster = meta_cluster$hclust.obj
  labels = labels(distance_matrix)

  groups <- cutree(cluster, k=num_clusters)

  # NEEDS FIX
  # if(exists("DEBUG") && DEBUG == TRUE) {
  #   # Plot result of clustering to PDF file
  #   pdf("clustering.pdf", width=19, height=12)
  #   plot(cluster, labels=metadata$title, cex=0.6)
  #   rect.hclust(cluster, k=num_clusters, border="red")
  #   dev.off()
  # }

  vclog$info(paste("Number of Clusters:", num_clusters, sep=" "))
  vclog$debug(paste("CutOff-Description:", attributes(cut_off)$description))

  clusters = list("labels"=labels, "cluster"=cluster, "groups"=groups, "num_clusters"=num_clusters)
  return(clusters)

}


get_ndms <- function(distance_matrix, mindim=2, maxdim=2, maxit=500) {

  # Perform non-metric multidimensional scaling
  # nm <- par.nmds(distance_matrix, mindim=mindim, maxdim=maxdim, maxit=maxit)
  # nm.nmin = nmds.min(nm)
  ord <- metaMDS(distance_matrix, k = 2, parallel = 3)
  points <- ord$points

  vclog$info(paste("NMDS-Stress:", min(ord$stress), sep=" "))
  # vclog$info(paste("NMDS-R2:", min(nm$r2), sep=" "))

  # NEEDS FIX
  # if(exists("DEBUG") && DEBUG == TRUE) {
  #   # Plot results from multidimensional scaling, highlight clusters with symbols
  #   pdf("mds.pdf")
  #   plot(nm.nmin, pch=groups)
  #   dev.off()
  # }
  layout <- list(X1 = points[,1], X2 = points[,2])
  return(layout)
}
