rm(list = ls())

args <- commandArgs(TRUE)
wd <- args[1]
query <- args[2]
service <- args[3]
params_file <- args[4]
input_file <- args[5]


print(wd)
print(query)
print(service)
print(params_file)

setwd(wd) #Don't forget to set your working directory

renv::activate()
renv::restore( lockfile = './renv.lock')

source('utils.R')
source("vis_layout.R")
DEBUG = FALSE

params <- fromJSON(params_file)

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

tslog <- getLogger('ts')

tryCatch({
  output_json = vis_layout(text, metadata,
                           service,
                           max_clusters = params$MAX_CLUSTERS,
                           add_stop_words = params$language,
                           lang = params$language,
                           taxonomy_separator = params$taxonomy_separator,
                           list_size = params$list_size)
}, error=function(err){
 tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err, sep="||")))
 failed$query <<- query
 failed$processing_reason <<- err$message
})

if (!exists('output_json')) {
  output_json <- detect_error(failed)
}

print(output_json)
