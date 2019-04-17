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
  sg_data <- sg_data %>% ungroup() %>% mutate(year=as.factor(year))
  df <- data.frame(row.names = c('name', 'data', 'ids_overall', 'ids_timestep'))
  for (item in unique(sg_data[!is.na(sg_data$stream_item),]$stream_item)) {
    new_item <- list()
    new_item$name <- item
    tmp <- sg_data %>% subset(stream_item == item)
    tmp <- merge(tmp, tmp %>% select(year) %>% expand(year), all=TRUE) %>% replace_na(list(stream_item=item, count=0, ids="NA"))
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

get_new_levels <- function(levels_old, n_levels) {
  levels_new <- vector("list")
  for (i in 1:n_levels-1){
    x <- gsub("\\[|\\)|\\]", "", levels_old[i])
    x <- unlist(lapply(strsplit(x, ","), as.integer))
    x[2] <- x[2] - 1
    x <- paste(x, collapse=" - ")
    levels_new[i] <- x
  }
  x <- gsub("\\[|\\)|\\]", "", levels_old[n_levels])
  x <- unlist(lapply(strsplit(x, ","), as.integer))
  x <- paste(x, collapse=" - ")
  levels_new[n_levels] <- x
  return (unlist(levels_new))
}

rename_xaxis <- function(boundary_label) {
  n_levels = length(levels(metadata$boundary_label))
  boundary_label <- get_new_levels(levels(boundary_label), n_levels)
  return(boundary_label)
}

sg_data = list()

if (service == 'linkedcat' || service == 'linkedcat_authorview') {
  stream_range = list(min=min(metadata$year), max=max(metadata$year), range=max(metadata$year)-min(metadata$year))
  n_breaks = min(stream_range$range, 11)
  if (n_breaks > 10) {
    metadata <- mutate(metadata, boundary_label=cut(metadata$year, n_breaks, include.lowest = TRUE, right=FALSE))
    levels(metadata$boundary_label) <- rename_xaxis(metadata$boundary_label)
  } else {
    metadata$boundary_label <- as.factor(metadata$year)
    levels(metadata$boundary_label) <- levels(as.factor(stream_range$min:stream_range$max))
  }
  sg_data$x <- levels(metadata$boundary_label)
  sg_data$subject <- ((merge(metadata 
                           %>% select(boundary_label, year, subject, id) 
                           %>% separate_rows(subject, sep="; ")
                           %>% rename(stream_item=subject) 
                           %>% mutate(count=1),
                           metadata 
                           %>% select(boundary_label) 
                           %>% expand(boundary_label) 
                           %>% rename(year=boundary_label), 
                           all=TRUE))
                    %>% group_by(year, stream_item, .drop=FALSE) 
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
                      %>% arrange(match(stream_item, top_20), year))
  sg_data$area <- ((merge(metadata
                     %>% select(boundary_label, year, area, id)
                     %>% rename(stream_item=area)
                     %>% mutate(count=1),
                     metadata
                     %>% select(boundary_label)
                     %>% expand(boundary_label)
                     %>% rename(year=boundary_label),
                     all=TRUE))
                   %>% group_by(year, stream_item, .drop=FALSE)
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
