rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)

setwd(wd)

query <- "digital education"
service <- "core"
params <- NULL
params_file <- "params_core.json"

source('../utils.R')
DEBUG = FALSE

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

source("../vis_layout.R")
source('../core.R')

MAX_CLUSTERS = 15
LANGUAGE = "english"
ADDITIONAL_STOP_WORDS = "english"

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

input_data = get_papers(query, params, limit=100)

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS,
                         lang=LANGUAGE,
                         add_stop_words=ADDITIONAL_STOP_WORDS, testing=TRUE)

print(output_json)
