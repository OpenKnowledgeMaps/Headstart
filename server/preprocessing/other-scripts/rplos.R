rm(list = ls())

args <- commandArgs(TRUE)
wd <-args[1]
query <- args[2]

setwd(wd) #Don't forget to set your working directory
library(GMD)
library(MASS)
library(ecodist)
library(tm)
library(proxy)
library(SnowballC)
library(rplos)
library(jsonlite)

debug = FALSE

# Get data from PLOS API
start.time <- Sys.time()

search_data <- searchplos(q=query, fl='title,id,counter_total_month,abstract,journal,publication_date,author,everything,subject', 
                       fq='doc_type:full', limit=100)

end.time <- Sys.time()
time.taken <- end.time - start.time
time.taken

cooc = search_data$data

names(cooc)[names(cooc)=="counter_total_month"] <- "readers"
names(cooc)[names(cooc)=="abstract"] <- "paper_abstract"
names(cooc)[names(cooc)=="journal"] <- "published_in"
names(cooc)[names(cooc)=="publication_date"] <- "year"
names(cooc)[names(cooc)=="author"] <- "authors"
cooc["url"] = paste("http://dx.doi.org/", cooc$id, sep="")
cooc["titleabstract"] = paste(cooc$title, cooc$abstract, sep=" ")
dates = as.Date(cooc$year)
cooc$year = format(dates, format="%B %d %Y")


metadata = cooc
metadata$everything <- NULL

m <- list(content = "everything", id = "id", title = "title", counter = "readers"
          , journal = "published_in", date = "year", author = "authors"
          , abstract = "paper_abstract", subject = "subject")

myReader <- readTabular(mapping = m)

(corpus <- Corpus(DataframeSource(cooc), readerControl = list(reader = myReader)))

corpus <- tm_map(corpus, removePunctuation)

corpus <- tm_map(corpus, stripWhitespace)

corpus <- tm_map(corpus, content_transformer(tolower))

corpus <- tm_map(corpus, removeWords, stopwords("english"))

corpus_unstemmed = corpus

corpus <- tm_map(corpus, stemDocument)

tdm <- TermDocumentMatrix(corpus)

tdm <- removeSparseTerms(tdm, 0.3)

tdm_matrix = t(as.matrix(tdm))

distance_matrix_2 <- as.matrix(proxy::dist(tdm_matrix, method = "cosine"))
distance_matrix = as.dist(distance_matrix_2)

# Perform clustering, use elbow to determine a good number of clusters
css_cluster <- css.hclust(distance_matrix, hclust.FUN.MoreArgs=list(method="ward.D"))
cut_off = elbow.batch(css_cluster)

num_clusters = cut_off$k
meta_cluster = attr(css_cluster,"meta")
cluster = meta_cluster$hclust.obj
labels = labels(distance_matrix)
groups <- cutree(cluster, k=num_clusters)

if(debug == TRUE) {
  # Plot result of clustering to PDF file
  pdf("clustering.pdf", width=19, height=12)
  plot(cluster, labels=metadata$title, cex=0.6)
  rect.hclust(cluster, k=num_clusters, border="red")
  dev.off()
}

num_clusters

# Perform non-metric multidimensional scaling
nm = nmds(distance_matrix, mindim=2, maxdim=2)
nm.nmin = nmds.min(nm)
x = nm.nmin$X1
y = nm.nmin$X2

if(debug == TRUE) {
  # Plot results from multidimensional scaling, highlight clusters with symbols
  pdf("mds.pdf")
  plot(nm.nmin, pch=groups)
  dev.off()
}

# Prepare the output
result = cbind(x,y,groups,labels)
output = merge(metadata, result, by.x="id", by.y="labels", all=TRUE)
names(output)[names(output)=="groups"] <- "area_uri"
output["area"] = paste("Cluster ", output$area_uri, sep="")

output_json = toJSON(output)
print(output_json)

if(debug == TRUE) {
  # Write output to file
  file_handle = file("output_file.csv", open="w")
  write.csv(output, file=file_handle, row.names=FALSE)
  close(file_handle)
  
  # # Write some stats to a file
  file_handle = file("stats.txt", open="w")
  writeLines(c(paste("Number of Clusters:", num_clusters, sep=" ")
     , paste("Description:", attributes(cut_off)$description)
     , paste("Stress:", min(nm$stress), sep=" ")
     , paste("R2:", max(nm$r2), sep=" ")
     ), file_handle)
   
   close(file_handle)
}