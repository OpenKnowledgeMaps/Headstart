### FOR BASE

rm(list = ls())

library(rstudioapi)
library(jsonlite)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)

setwd(wd) #Don't forget to set your working directory

query <- "digital education" #args[2]
service <- "base"
params <- NULL
params_file <- "snapshot_params_base.json"

source('../utils.R')
DEBUG = FALSE

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

tslog <- getLogger('ts')

source("../vis_layout.R")
source('../base.R')


MAX_CLUSTERS = 15
LANGUAGE = "english"
ADDITIONAL_STOP_WORDS = "english"

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

#start.time <- Sys.time()

tryCatch({
  input_data = get_papers(query, params, limit=120)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Query failed", service, query, paste(params, collapse=" "), err, sep="||")))
})
write_json(input_data, "snapshots/snapshot_base_input.json")
#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken
tryCatch({
output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS,
                         lang=LANGUAGE,
                         add_stop_words=ADDITIONAL_STOP_WORDS, testing=TRUE, list_size=100)
}, error=function(err){
tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err)))
})

write_json(data.frame(fromJSON(output_json)), "snapshots/snapshot_base_expected.json")


### FOR PUBMED

rm(list = ls())

library(rstudioapi)
library(jsonlite)

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
LANGUAGE = "english"
ADDITIONAL_STOP_WORDS = "english"

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

#start.time <- Sys.time()

tryCatch({
  input_data = get_papers(query, params)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Query failed", service, query, paste(params, collapse=" "), err, sep="||")))
})
write_json(input_data, "snapshots/snapshot_pubmed_input.json")
#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken
tryCatch({
output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS,
                         lang=LANGUAGE,
                         add_stop_words=ADDITIONAL_STOP_WORDS, testing=TRUE)
}, error=function(err){
tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err, sep="||")))
})

write_json(data.frame(fromJSON(output_json)), "snapshots/snapshot_pubmed_expected.json")
