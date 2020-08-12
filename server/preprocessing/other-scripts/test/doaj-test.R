rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)
setwd(wd) #Don't forget to set your working directory

query <- "marketing" #args[2]
service <- "doaj"
params <- NULL
params_file <- "params_doaj.json"

source('../utils.R')
DEBUG = FALSE

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

tslog <- getLogger('ts')

source("../vis_layout.R")
source('../doaj.R')

MAX_CLUSTERS = 15

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

ADDITIONAL_STOP_WORDS = "english"

#start.time <- Sys.time()
failed <- list(params=params)
tryCatch({
  input_data = get_papers(query, params)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Query failed", service, query, paste(params, collapse=" "), err, sep="||")))
  failed$query <<- query
  failed$query_reason <<- err$message
})

#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken
tryCatch({
output_json = vis_layout(input_data$text, input_data$metadata,
                         service,
                         max_clusters=MAX_CLUSTERS,
                         lang="english",
                         add_stop_words=ADDITIONAL_STOP_WORDS, testing=TRUE)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err, sep="||")))
  failed$query <<- query
  failed$processing_reason <<- err$message
})

if (!exists('output_json')) {
  output_json <- detect_error(failed)
}

print(output_json)
