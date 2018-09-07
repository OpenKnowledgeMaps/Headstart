rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)
Sys.setenv('HEADSTART_LOGFILE'='test.log')

setwd(wd) #Don't forget to set your working directory

# query: project acryonm
# params: grant_id and funding_stream
query <- "GRINDOOR" #args[2]
service <- "openaire"
params <- NULL
params_file <- "params_openaire.json"

source('../utils.R')
source("../vis_layout.R")
source('../openaire.R')
source('../altmetrics.R')

DEBUG = FALSE

MAX_CLUSTERS = 15
ADDITIONAL_STOP_WORDS = "english"

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}


input_data = get_papers(query, params)

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS,
                         add_stop_words=ADDITIONAL_STOP_WORDS, testing=TRUE, list_size=-1)

if (service=='openaire'){
  output_json_with_metrics = enrich_output_json(output_json)
}

print(output_json_with_metrics)
