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
commit_id <- "334154e-dev" # latest master commit considered stable; switch to release tag later


diffcols <- c("var.x", "var.y", "id", "values.x", "values.y", "row.x", "row.y", "query", "service")
diffs_in <- data.frame(matrix(ncol=length(diffcols),nrow=0))
colnames(diffs_in) <- diffcols
diffs_out <- data.frame(matrix(ncol=length(diffcols),nrow=0))
colnames(diffs_out) <- diffcols
diffs_process <- data.frame(matrix(ncol=length(diffcols),nrow=0))
colnames(diffs_process) <- diffcols
docs_not_shared <- data.frame(matrix(ncol=3,nrow=0))
colnames(docs_not_shared) <- c("version", "id", "observation")

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
  new_output$x <- as.numeric(new_output$x)
  new_output$y <- as.numeric(new_output$y)
  old_output <- fromJSON(paste("snapshots/snapshot_",
                               commit_id, "_",
                               service, "_",
                               query, "_",
                               "output.json"))
  old_output$x <- as.numeric(old_output$x)
  old_output$y <- as.numeric(old_output$y)

  sum_in <- summary(comparedf(old_input_data$metadata, input_data$metadata, by="id"))
  sum_out <- summary(comparedf(old_output, new_output, by="id", control=list(tol.num="absolute", tol.num.val=0.5)))
  if (nrow(sum_in$diffs.table) > 0){
    sum_in$diffs.table$query <- query
    sum_in$diffs.table$service <- service
    diffs_in <- rbind(diffs_in, sum_in$diffs.table)
  }
  if (nrow(sum_in$obs.table) > 0){
    sum_in$obs.table$query <- query
    sum_in$obs.table$service <- service
    docs_not_shared <- rbind(docs_not_shared, sum_in$obs.table)
  }
  if (nrow(sum_out$diffs.table) > 0){
    sum_out$diffs.table$query <- query
    sum_out$diffs.table$service <- service
    diffs_out <- rbind(diffs_out, sum_out$diffs.table)
  }

  process_diffs_old <- summary(comparedf(old_input_data$metadata, old_output, by="id"))
  if (nrow(process_diffs_old$diffs.table) > 0){
    process_diffs_old$diffs.table$query <- query
    process_diffs_old$diffs.table$service <- service
    process_diffs_old$diffs.table$version <- "old"
    diffs_process <- rbind(diffs_process, process_diffs_old$diffs.table)
  }
  process_diffs_new <- summary(comparedf(input_data$metadata, new_output, by="id"))
  if (nrow(process_diffs_new$diffs.table) > 0){
    process_diffs_new$diffs.table$query <- query
    process_diffs_new$diffs.table$service <- service
    process_diffs_new$diffs.table$version <- "new"
    diffs_process <- rbind(diffs_process, process_diffs_new$diffs.table)
  }
}

diffs_out %>% subset(var.x == "area") %>% subset(values.x=="")
diffs_out %>% subset(var.x == "subject") %>% subset(values.x=="")


#diffs_out %>% subset(var.x == "area") %>% view()
#diffs_out %>% subset(var.x == "subject") %>% view()
docs_not_shared
