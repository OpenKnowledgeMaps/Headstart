rm(list = ls())
library(logging)
library(jsonlite)
library(dplyr)
library(data.table)
library(tidyr)

args <- commandArgs(TRUE)
wd <- args[1]
service <- args[2]
tmp_json <- args[3]

setwd(wd) #Don't forget to set your working directory

source('../other-scripts/utils.R')
DEBUG = FALSE

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

sglog <- getLogger('sg')

start.time <- Sys.time()
metadata <- fromJSON(tmp_json)

sg_data = list()

if (service == 'linkedcat' || service == 'linkedcat_authorview') {
  boundaries <- data.frame(min=c(1847, 1850, 1860, 1870, 1880, 1890, 1900, 1910),
                           max=c(1849, 1859, 1869, 1879, 1889, 1899, 1909, 1918))
  boundaries$year <- apply(boundaries, 1, function(x) {paste(x[1]:x[2], collapse=", ")})
  boundaries$boundary_label <- apply(boundaries, 1, function(x) {paste(x[1], x[2], sep=" - ")})
  boundaries <- boundaries %>% separate_rows(year, sep=", ") %>% select(year, boundary_label)
  metadata <- merge(x = metadata, y = boundaries, by.x='year', by.y='year', all = TRUE)
  sg_data$area <- metadata %>% group_by(boundary_label, area) %>% summarize(count = uniqueN(id), ids = list(unique(id)))
  sg_data$subject <- metadata %>% separate_rows(subject, sep="; ") %>% mutate(count=1) %>% complete(boundary_label, subject, fill=list(count=0)) %>% group_by(boundary_label, subject, .drop=FALSE) %>% summarise(count=sum(count), ids=paste(id, collapse=", "))
  sg_data$bkl_caption <- metadata %>% separate_rows(bkl_caption, sep="; ") %>% group_by(boundary_label, bkl_caption) %>% summarize(count = uniqueN(id), ids = list(unique(id)))
}

end.time <- Sys.time()
time.taken <- end.time - start.time
sglog$info(paste("Time taken streamgraph:", time.taken, sep=" "))
print(toJSON(sg_data, auto_unbox = TRUE))
