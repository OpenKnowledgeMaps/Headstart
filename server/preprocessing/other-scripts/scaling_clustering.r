rm(list = ls())

args <- commandArgs(TRUE)
wd <-args[1]
cooc_file <- args[2]
metadata_file <- args[3]
output_file <- args[4]
mode <- args[5]

setwd(wd) #Don't forget to set your working directory
library(GMD)
library(MASS)
library(ecodist)
library(tm)
library(proxy)
library(SnowballC)

# Read input files

metadata <- read.csv(metadata_file)

if(mode == "text") {
  cooc <- read.csv(cooc_file, header=TRUE) # You will need to have your own co-occurrence file here
  
  m <- list(Content = "content", ID = "id")
  
  myReader <- readTabular(mapping = m)
  
  (corpus <- Corpus(DataframeSource(cooc), readerControl = list(reader = myReader)))
  
  corpus <- tm_map(corpus, removePunctuation, preserve_intra_word_dashes = FALSE)
  
  corpus <- tm_map(corpus, stripWhitespace)
  
  corpus <- tm_map(corpus, tolower)
  
  corpus <- tm_map(corpus, removeWords, stopwords("english"))
  
  corpus <- tm_map(corpus, stemDocument)
  
  tdm <- TermDocumentMatrix(corpus)
  
  distance_matrix <- dissimilarity(tdm, method="correlation")
  
  write.csv(as.matrix(distance_matrix), "matrix.csv")
  
} else {
  
  cooc <- read.csv(cooc_file, header=FALSE) # You will need to have your own co-occurrence file here
  
  # Create symmetric matrix from co-occurrences list
  cooc_matrix_sym <- tapply(as.numeric(cooc$V3), list(cooc$V1, cooc$V2), max)
  
  if(isSymmetric(cooc_matrix_sym) == FALSE)  {
    stop("Input matrix not symmetric")
  }
  
  # Calculate correlation coefficients
  cooc_matrix_cor = cor(cooc_matrix_sym, use="pairwise.complete.obs")
  
  # Calculate Euclidian distance
  distance_matrix <- dist(data.matrix(cooc_matrix_cor))
}

# Perform clustering, use elbow to determine a good number of clusters
css_cluster <- css.hclust(distance_matrix, hclust.FUN.MoreArgs=list(method="ward"))
#cut_off = elbow.batch(css_cluster)
cut_off = elbow.batch(css_cluster,inc.thres=c(0.01,0.05,0.1),
                      ev.thres=c(0.95,0.9,0.8,0.75,0.67,0.5,0.33,0.2,0.1),precision=3)
num_clusters = cut_off$k
meta_cluster = attr(css_cluster,"meta")
cluster = meta_cluster$hclust.obj
labels = labels(distance_matrix)

# Plot result of clustering to PDF file
pdf("clustering.pdf", width=19, height=12)
plot(cluster, labels=labels, cex=0.6)
rect.hclust(cluster, k=num_clusters, border="red")
dev.off()

cat(num_clusters)

# Perform non-metric multidimensional scaling
nm = nmds(distance_matrix, mindim=2, maxdim=2)
nm.nmin = nmds.min(nm)
x = nm.nmin$X1
y = nm.nmin$X2

# Plot results from multidimensional scaling, highlight clusters with symbols
pdf("mds.pdf")
groups <- cutree(cluster, k=num_clusters)
plot(nm.nmin, pch=groups)
dev.off()

# Prepare the output
result = cbind(x,y,groups,labels)
output = merge(metadata, result, by.x="id", by.y="labels", all=TRUE)

# Write output to file
file_handle = file(output_file, open="w")
write.csv(output, file=file_handle, row.names=FALSE)
close(file_handle)

# Write some stats to a file
file_handle = file("stats.txt", open="w")
writeLines(c(paste("Number of Clusters:", num_clusters, sep=" ")
  , paste("Description:", attributes(cut_off)$description)
  , paste("Stress:", min(nm$stress), sep=" ")
  , paste("R2:", max(nm$r2), sep=" ")
  ), file_handle)

close(file_handle)    