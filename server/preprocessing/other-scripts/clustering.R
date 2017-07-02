normalize_matrix <- function(tdm_matrix, method = "cosine") {
  distance_matrix_2 <- as.matrix(proxy::dist(tdm_matrix, method))
  distance_matrix = as.dist(distance_matrix_2)

  return(distance_matrix)
}

create_clusters <- function(distance_matrix, max_clusters=-1,
                            method="ward.D") {
  # Perform clustering, use elbow to determine a good number of clusters
  css_cluster <- css.hclust(distance_matrix,
                            hclust.FUN.MoreArgs = list(method = "ward.D"))
  cut_off <<- elbow.batch(css_cluster)

  num_clusters = cut_off$k

  if (max_clusters > -1 && num_clusters > max_clusters) {
    num_clusters = MAX_CLUSTERS
  }

  meta_cluster = attr(css_cluster, "meta")
  cluster = meta_cluster$hclust.obj
  labels = labels(distance_matrix)
  groups <- cutree(cluster, k = num_clusters)

  if (debug == TRUE) {
    # Plot result of clustering to PDF file
    pdf("clustering.pdf", width = 19, height = 12)
    plot(cluster, labels = metadata$title, cex = 0.6)
    rect.hclust(cluster, k = num_clusters, border = "red")
    dev.off()
  }

  clusters = list("labels" = labels, "cluster" = cluster,
                  "groups" = groups, "num_clusters" = num_clusters)
  return(clusters)
}

create_ordination <- function(distance_matrix,
                              mindim=2, maxdim=2, maxit=500) {

  # Perform non-metric multidimensional scaling
  nm <<- par.nmds(distance_matrix,
                  mindim = mindim, maxdim = maxdim, maxit = maxit)
  nm.nmin = nmds.min(nm)

  if (debug == TRUE) {
    # Plot results from multidimensional scaling,
    # highlight clusters with symbols
    pdf("mds.pdf")
    plot(nm.nmin, pch = groups)
    dev.off()
  }

  return(nm.nmin)
}
