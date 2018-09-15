rm(list = ls())

library(rstudioapi)
library(arsenal)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)
setwd(wd) #Don't forget to set your working directory

query <- "health education" #args[2]
service <- "pubmed"
params <- NULL
params_file <- "snapshot_params_pubmed.json"

source('../utils.R')
DEBUG = FALSE

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

source("../vis_layout.R")
source('../pubmed.R')


MAX_CLUSTERS = 15
ADDITIONAL_STOP_WORDS = "english"

#start.time <- Sys.time()

input_data = fromJSON("snapshots/snapshot_pubmed_input.json")

#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS,
                         add_stop_words=ADDITIONAL_STOP_WORDS, testing=TRUE)

output <- data.frame(fromJSON(output_json))
expected <- fromJSON("snapshots/snapshot_pubmed_expected.json")

summary(compare(output, expected, by="id"))
cmp <- compare(output, expected, by="id")
diffs(cmp, by.var=TRUE)
