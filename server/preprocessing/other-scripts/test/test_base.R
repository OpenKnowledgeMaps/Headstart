rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(dirname(rstudioapi::getActiveDocumentContext()$path))
setwd(wd) #Don't forget to set your working directory

query <- "parzival" #args[2]
service <- "base"
params <- NULL
params_file <- "test/params_base.json"

source('utils.R')
DEBUG = FALSE

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

tslog <- getLogger('ts')

source("vis_layout.R")
source('base.R')

MAX_CLUSTERS = 15

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

if ('lang_id' %in% names(params)){
    lang_id <- params$lang_id
  } else {
    lang_id <- 'all'
}

.GlobalEnv$VIS_ID <- params$vis_id

#start.time <- Sys.time()
failed <- list(params=params)
tryCatch({
  query <- sanitize_query(query)
  input_data = get_papers(query$sanitized_query, params)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Query failed", service, query$raw_query, paste(params, collapse=" "), err, sep="||")))
  failed$query <<- query$raw_query
  failed$query_reason <<- err$message
})

#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken
if(exists('input_data')) {
  tryCatch({
  output_json = vis_layout(input_data$text, input_data$metadata,
                           service,
                           max_clusters=MAX_CLUSTERS, list_size = params$list_size)
  }, error=function(err){
    tslog$error(gsub("\n", " ", paste("Processing failed", query$raw_query, paste(params, collapse=" "), err, sep="||")))
    failed$query <<- query$raw_query
    failed$processing_reason <<- err$message
  })
}

if (!exists('output_json')) {
  output_json <- detect_error(failed, service, params)
}

output <- fromJSON(output_json)
#print(output_json)
