rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)
setwd(wd) #Don't forget to set your working directory

query <- "Öffentlichkeit" #args[2]
service <- "base"
params <- NULL
params_file <- "params_base_ger.json"

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
LANGUAGE = "german"
ADDITIONAL_STOP_WORDS = "german"

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

#start.time <- Sys.time()




tryCatch({
  input_data = get_papers(query, params, limit=120)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Query failed:", service, query, params, err, sep="||")))
})

#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken
tryCatch({
output_json = vis_layout(input_data$text, input_data$metadata,
                         max_clusters = MAX_CLUSTERS,
                         lang = LANGUAGE,
                         add_stop_words = ADDITIONAL_STOP_WORDS,
                         testing=TRUE, list_size=100)
}, error=function(err){
tslog$error(gsub("\n", " ", paste("Processing failed:", query, params, err)))
})

print(output_json)
