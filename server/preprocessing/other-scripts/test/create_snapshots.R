rm(list = ls())

library(rstudioapi)
library(jsonlite)

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


taxonomy_separator = NULL

source("../vis_layout.R")


MAX_CLUSTERS = 15
LANGUAGE = "english"
ADDITIONAL_STOP_WORDS = "english"


test_cases <- read.csv("queries.csv")
commit_id <- "60bb5eb" # latest master commit considered stable; switch to release tag later
# check that you actually are on that commit when creating snapshots

for (service in c("base", "pubmed")) {
  params <- NULL
  params_file <- paste0("params_", service, "_snapshot.json")
  params <- fromJSON(params_file)
  switch(service,
          base={
            source('../base.R')
            limit = 120
            list_size = 100
          },
          pubmed={
            source('../pubmed.R')
            limit = 100
            list_size = -1
          }
         )

  for (query in test_cases$query) {
    tryCatch({
      input_data = get_papers(query, params, limit=limit)
      write_json(input_data,
                 paste("snapshots/snapshot_",
                       commit_id, "_",
                       service, "_",
                       query, "_",
                       "input.json"))
    }, error=function(err){
      tslog$error(gsub("\n", " ", paste("Query failed", service, query, paste(params, collapse=" "), err, sep="||")))
    })
    tryCatch({
      output_json = vis_layout(input_data$text, input_data$metadata,
                               service,
                               max_clusters=MAX_CLUSTERS, add_stop_words=ADDITIONAL_STOP_WORDS,
                               lang=LANGUAGE,
                               taxonomy_separator=taxonomy_separator, list_size = list_size,
                               testing=TESTING)

      write_json(data.frame(fromJSON(output_json)),
                 paste("snapshots/snapshot_",
                       commit_id, "_",
                       service, "_",
                       query, "_",
                       "output.json"))
    }, error=function(err){
    tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err)))
    })
  }
}
