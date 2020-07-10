rm(list = ls())

args <- commandArgs(TRUE)
wd <- args[1]
query <- args[2]
service <- args[3]

setwd(wd) #Don't forget to set your working directory

renv::activate()
renv::restore(lockfile = './renv.lock')

library(jsonlite)
library(logging)
source('utils.R')
if (Sys.getenv("BASE_LOGLEVEL") == "DEBUG") {
  DEBUG <- FALSE
} else {
  DEBUG <- TRUE
}


tslog <- getLogger('ts')

f <- file("stdin")
open(f)
data = fromJSON(readLines(f))
params <- data$params


if (!is.null(params$lang_id)) {
  lang_id <- params$lang_id
} else {
  lang_id <- 'all'
}
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
