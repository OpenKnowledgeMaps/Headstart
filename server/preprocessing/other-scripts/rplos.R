rm(list = ls())

args <- commandArgs(TRUE)
wd <-args[1]
query <- args[2]

setwd(wd) #Don't forget to set your working directory
#setwd(wd) #Don't forget to set your working directory
library(GMD)
library(MASS)
library(ecodist)
library(tm)
library(proxy)
library(SnowballC)
library(rplos)
library(jsonlite)

# Read input files

search_data <- searchplos(q=query, fl='title,id,counter_total_month,abstract,journal,publication_date,author,everything', 
                       fq='doc_type:full', limit=50, sort='counter_total_month desc')

#load("search_data.RData")

cooc = search_data$data

names(cooc)[names(cooc)=="counter_total_month"] <- "readers"
names(cooc)[names(cooc)=="abstract"] <- "paper_abstract"
names(cooc)[names(cooc)=="journal"] <- "published_in"
names(cooc)[names(cooc)=="publication_date"] <- "year"
names(cooc)[names(cooc)=="author"] <- "authors"
cooc["url"] = paste("http://dx.doi.org/", cooc$id, sep="")


metadata = cooc
metadata$everything <- NULL

m <- list(content = "everything", id = "id", title = "title", counter = "readers"
          , journal = "published_in", date = "year", author = "authors"
          , abstract = "paper_abstract")

myReader <- readTabular(mapping = m)

(corpus <- Corpus(DataframeSource(cooc), readerControl = list(reader = myReader)))

corpus <- tm_map(corpus, removePunctuation)

corpus <- tm_map(corpus, stripWhitespace)

corpus <- tm_map(corpus, content_transformer(tolower))

corpus <- tm_map(corpus, removeWords, stopwords("english"))

corpus <- tm_map(corpus, stemDocument)

tdm <- TermDocumentMatrix(corpus)

#remove sparse terms?

distance_matrix_2 <- as.matrix(proxy::dist(t(as.matrix(tdm)), method = "cosine"))
distance_matrix = as.dist(distance_matrix_2)
#diag(distance_matrix) <- NA
write.csv(as.matrix(distance_matrix), "matrix.csv")


# Perform clustering, use elbow to determine a good number of clusters
css_cluster <- css.hclust(distance_matrix, hclust.FUN.MoreArgs=list(method="ward.D"))
cut_off = elbow.batch(css_cluster)
#cut_off = elbow.batch(css_cluster,inc.thres=c(0.01,0.05,0.1),
#                      ev.thres=c(0.95,0.9,0.8,0.75,0.67,0.5,0.33,0.2,0.1),precision=3)
num_clusters = cut_off$k
meta_cluster = attr(css_cluster,"meta")
cluster = meta_cluster$hclust.obj
labels = labels(distance_matrix)

# Plot result of clustering to PDF file
pdf("clustering.pdf", width=19, height=12)
plot(cluster, labels=metadata$title, cex=0.6)
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
names(output)[names(output)=="groups"] <- "area_uri"
output["area"] = paste("Cluster ", output$area_uri, sep="")

# Write output to file
file_handle = file("output_file.csv", open="w")
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

print(toJSON(output))