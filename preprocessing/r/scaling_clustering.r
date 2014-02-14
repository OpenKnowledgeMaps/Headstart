rm(list = ls())
setwd("") #Don't forget to set your working directory
library(GMD)
library(MASS)
library(ecodist)

# Read input files
cooc <- read.table("cooc.csv", header=FALSE, sep="\t", quote=NULL) # You will need to have your own co-occurrence file here
metadata <- read.csv("metadata.csv")

# Create symmetric matrix from co-occurrences list
cooc_matrix_sym <- tapply(as.numeric(cooc$V3), list(cooc$V1, cooc$V2), max)

if(isSymmetric(cooc_matrix_sym) == FALSE)	{
	stop("Input matrix not symmetric")
}

# Calculate correlation coefficients
cooc_matrix_cor = cor(cooc_matrix_sym, use="pairwise.complete.obs")

# Calculate Euclidian distance
distance_matrix <- dist(data.matrix(cooc_matrix_cor))

# Perform clustering, use elbow to determine a good number of clusters
css_cluster <- css.hclust(distance_matrix, hclust.FUN.MoreArgs=list(method="ward"))
cut_off = elbow.batch(css_cluster)
num_clusters = cut_off$k
meta_cluster = attr(css_cluster,"meta")
cluster = meta_cluster$hclust.obj
labels = as.vector(row.names(cooc_matrix_cor))

# Plot result of clustering to PDF file
pdf("clustering.pdf", width=19, height=12)
plot(cluster, labels=labels, cex=0.6)
rect.hclust(cluster, k=num_clusters, border="red")
dev.off()

# Perform non-metric multidimensional scaling
nm = nmds(distance_matrix, mindim=2, maxdim=2)
nm.nmin = nmds.min(nm)
x = nm.nmin$X1
y = nm.nmin$X2

# Plot results from multidimensional scaling, highlight clusters with symbols
dev.new()
plot.new()
groups <- cutree(cluster, k=num_clusters)
plot(nm.nmin, pch=groups)

# Prepare the output
result = cbind(x,y,groups,labels)
output = merge(metadata, result, by.x="title", by.y="labels", all=TRUE)

# Write output to file
file_handle = file("output_scaling_clustering.csv", open="w")
write.csv(output, file=file_handle, row.names=FALSE)
close(file_handle)

# Write some stats to a file
file_handle = file("stats.txt", open="w")
writeLines(c(paste("Number of Clusters:", num_clusters, sep=" ")
  , paste("Stress:", min(nm$stress), sep=" ")
  , paste("R2:", max(nm$r2), sep=" ")
  ), file_handle)

close(file_handle)    