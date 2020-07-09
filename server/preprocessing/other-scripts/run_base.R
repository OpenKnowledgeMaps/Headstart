rm(list = ls())

args <- commandArgs(TRUE)
wd <- args[1]
query <- args[2]
service <- args[3]
params_file <- args[4]

setwd(wd) #Don't forget to set your working directory

renv::activate()
renv::restore(lockfile = './renv.lock')

library(jsonlite)
library(logging)
source('utils.R')
DEBUG = FALSE

params <- fromJSON(params_file)

if (!is.null(params$lang_id)) {
  lang_id <- params$lang_id
} else {
  lang_id <- 'all'
}

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}


tslog <- getLogger('ts')
source('../other-scripts/altmetrics.R')
source('../other-scripts/base.R')
limit = 120
list_size = 100

failed <- list(params=params)
tryCatch({
  input_data = get_papers(query, params, limit=limit)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Query failed", service, query, paste(params, collapse=" "), err, sep="||")))
  failed$query <<- query
  failed$query_reason <<- err$message
})

print(toJSON(input_data))
