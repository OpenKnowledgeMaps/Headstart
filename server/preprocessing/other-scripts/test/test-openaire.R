rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)
setwd(wd) #Don't forget to set your working directory

# query: project acryonm
# params: grant_id and funding_stream
query <- "GRINDOOR" #args[2]
service <- "openaire"
params <- NULL
params_file <- "params_openaire.json"

source('../utils.R')
DEBUG = FALSE

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

tslog <- getLogger('ts')

source("../vis_layout.R")
source('../openaire.R')
source('../altmetrics.R')

MAX_CLUSTERS = 15

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

if ('lang_id' %in% names(params)){
    lang_id <- params$lang_id
  } else {
    lang_id <- 'all'
}

LANGUAGE <- get_service_lang(lang_id, valid_langs, service)
ADDITIONAL_STOP_WORDS = LANGUAGE$name


failed <- list(params=params)
tryCatch({
  input_data = get_papers(query, params)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Query failed", service, query, paste(params, collapse=" "), err, sep="||")))
  failed$query <<- query
  failed$query_reason <<- err$message
})

tryCatch({
output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS,
                         lang=LANGUAGE$name,
                         add_stop_words=ADDITIONAL_STOP_WORDS, testing=TRUE, list_size=-1)
}, error=function(err){
tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err, sep="||")))
  failed$query <<- query
  failed$processing_reason <<- err$message
})

if (service=='openaire' && exists('output_json')) {
  output_json = enrich_output_json(output_json)
}

if (!exists('output_json')) {
  output_json <- detect_error(failed)
}

print(output_json)
