rm(list = ls())

library(rstudioapi)
library(arsenal)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)
Sys.setenv('OKM_LOGFILE'='test.log')

setwd(wd) #Don't forget to set your working directory

query <- "digital education" #args[2]
service <- "base"
params <- NULL
params_file <- "params_base_snapshot.json"

DEBUG = FALSE

source('../utils.R')
source("../vis_layout.R")
source('../base.R')

MAX_CLUSTERS = 15
ADDITIONAL_STOP_WORDS = "english"

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

#start.time <- Sys.time()

input_data = get_papers(query, params, limit=120)

#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS,
                         add_stop_words=ADDITIONAL_STOP_WORDS, testing=TRUE, list_size=100)

output <- data.frame(fromJSON(output_json))
expected <- fromJSON("snapshots/snapshot_base.json")

summary(compare(output, expected, by="id"))
cmp <- compare(output, expected, by="id")
diffs(cmp, by.var=TRUE)
