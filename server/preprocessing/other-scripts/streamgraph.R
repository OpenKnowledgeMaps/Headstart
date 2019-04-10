rm(list = ls())
library(logging)
library(jsonlite)
library(dplyr)
library(data.table)
library(tidyr)
library(forcats)

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


post_process <- function(sg_data) {
  df <- data.frame(row.names = c('name', 'data', 'ids_overall', 'ids_timestep'))
  for (item in unique(sg_data[!is.na(sg_data$stream_item),]$stream_item)) {
    new_item <- list()
    new_item$name <- item
    tmp <- sg_data %>% subset(stream_item == item)
    new_item$y <- tmp$count
    new_item$ids_overall <- (tmp
                              %>% ungroup()
                              %>% separate_rows(ids, sep=", ")
                              %>% distinct(ids)
                              %>% filter(ids != "NA")
                              %>% select(ids)
                              %>% pull())
    new_item$ids_timestep <- lapply(tmp$ids, function(x) unlist(strsplit(x, split=", ")))
    df <- rbind(df, rbind(new_item))
  }
  rownames(df) <- 1:nrow(df)
  df$name <- unlist(df$name)
  return(df)
}



sg_data = list()

if (service == 'linkedcat' || service == 'linkedcat_authorview') {
  stream_range = list(min=min(metadata$year), max=max(metadata$year), range=max(metadata$year)-min(metadata$year))
  n_breaks = min(stream_range$range, 10)
  metadata <- mutate(metadata, boundary_label=cut(metadata$year, n_breaks))
  metadata$boundary_label <- metadata$boundary_label %>% fct_relabel(function(x) {gsub(",", " - ", gsub("\\(|\\]", "", paste(x)))})
  sg_data$x <- levels(metadata$boundary_label)
  sg_data$subject <- (metadata
                      %>% separate_rows(subject, sep="; ")
                      %>% rename(stream_item=subject)
                      %>% mutate(count=1)
                      %>% complete(boundary_label, stream_item, fill=list(count=0))
                      %>% group_by(boundary_label, stream_item, .drop=FALSE)
                      %>% summarise(count=sum(count), ids=paste(id, collapse=", ")))
  top_20 <-(sg_data$subject
            %>% group_by(stream_item)
            %>% summarise(sum = sum(count))
            %>% arrange(desc(sum))
            %>% drop_na()
            %>% head(20)
            %>% select(stream_item)
            %>% pull())
  sg_data$subject <- (sg_data$subject
                      %>% subset(stream_item %in% top_20)
                      %>% arrange(match(stream_item, top_20), boundary_label))
  sg_data$area <- (metadata
                   %>% rename(stream_item=area)
                   %>% mutate(count=1)
                   %>% complete(boundary_label, stream_item, fill=list(count=0))
                   %>% group_by(boundary_label, stream_item, .drop=FALSE)
                   %>% summarise(count=sum(count), ids=paste(id, collapse=", ")))
  #sg_data$bkl_caption <- metadata %>% separate_rows(bkl_caption, sep="; ") %>% group_by(boundary_label, bkl_caption) %>% summarize(count = uniqueN(id), ids = list(unique(id)))
  output <- list()
  output$x <- sg_data$x
  output$subject <- post_process(sg_data$subject)
  output$area <- post_process(sg_data$area)
}



end.time <- Sys.time()
time.taken <- end.time - start.time
sglog$info(paste("Time taken streamgraph:", time.taken, sep=" "))

print(toJSON(output))
