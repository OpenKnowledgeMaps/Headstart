rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)

setwd(wd) #Don't forget to set your working directory

query <- "247153" #args[2]
service <- "openaire"
params <- NULL
params_file <- "params_openaire.json"

source("../vis_layout.R")
source('../openaire.R')

debug = FALSE

MAX_CLUSTERS = 15
ADDITIONAL_STOP_WORDS = "english"

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}


input_data = get_papers(query, params)

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS,
                         add_stop_words=ADDITIONAL_STOP_WORDS, testing=TRUE, list_size=-1)

print(output_json)

