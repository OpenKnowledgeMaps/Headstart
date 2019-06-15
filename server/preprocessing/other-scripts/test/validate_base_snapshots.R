rm(list = ls())

library(rstudioapi)
library(arsenal)
library(tidyverse)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)

setwd(wd) #Don't forget to set your working directory


source('../utils.R')
DEBUG = FALSE
TESTING = TRUE

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}
tslog <- getLogger('ts')

service <- "base"
params <- NULL
params_file <- "params_base_snapshot.json"
params <- fromJSON(params_file)

source("../vis_layout.R")
source('../base.R')

MAX_CLUSTERS = 15
LANGUAGE = "english"
ADDITIONAL_STOP_WORDS = "english"

test_cases <- read.csv("top_queries.csv")
commit_id <- "334154e" # latest master commit considered stable; switch to release tag later


diffcols <- c("var.x", "var.y", "id", "values.x", "values.y", "row.x", "row.y", "query", "service")
diffs_in <- data.frame(matrix(ncol=length(diffcols),nrow=0))
colnames(diffs_in) <- diffcols
diffs_out <- data.frame(matrix(ncol=length(diffcols),nrow=0))
colnames(diffs_out) <- diffcols

for (query in test_cases$query) {
  old_input_data <- fromJSON(paste("snapshots/snapshot_",
                              commit_id, "_",
                              service, "_",
                              query, "_",
                              "input.json"))
  input_data <- get_papers(query, params, limit=120)

  tryCatch({
    new_output_json <- vis_layout(input_data$text, input_data$metadata,
                                 service,
                                 max_clusters=MAX_CLUSTERS, add_stop_words=ADDITIONAL_STOP_WORDS,
                                 lang=LANGUAGE,
                                 taxonomy_separator=NULL, list_size = 100,
                                 testing=TESTING)
  }, error=function(err){
    tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err, sep="||")))
  })

  new_output <- data.frame(fromJSON(new_output_json))
  old_output <- fromJSON(paste("snapshots/snapshot_",
                               commit_id, "_",
                               service, "_",
                               query, "_",
                               "output.json"))

  cmp_in <- comparedf(old_input_data$metadata, input_data$metadata, by="id")
  cmp_out <- comparedf(old_output, new_output, by="id")
  sum_in <- summary(cmp_in)
  sum_out <- summary(cmp_out)
  if (nrow(sum_in$diffs.table) > 0){
    sum_in$diffs.table$query <- query
    sum_in$diffs.table$service <- service
    diffs_in <- rbind(diffs_in, sum_in$diffs.table)
  }
  if (nrow(sum_out$diffs.table) > 0){
    sum_out$diffs.table$query <- query
    sum_out$diffs.table$service <- service
    diffs_out <- rbind(diffs_out, sum_out$diffs.table)
  }
}

diffs_out %>% subset(var.x == "area") %>% subset(values.x=="")
diffs_out %>% subset(var.x == "subject") %>% subset(values.x=="")