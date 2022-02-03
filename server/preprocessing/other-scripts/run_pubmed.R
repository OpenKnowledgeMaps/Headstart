rm(list = ls())

args <- commandArgs(TRUE)
wd <- args[1]
query <- args[2]
service <- args[3]

setwd(wd) #Don't forget to set your working directory

renv::activate()
renv::restore(lockfile = '../renv.lock')
Sys.setlocale(category="LC_ALL", locale = "en_US.UTF-8")

library(jsonlite)
library(logging)
library(doParallel)

source('utils.R')
if (Sys.getenv("LOGLEVEL") == "DEBUG") {
  DEBUG <- FALSE
} else {
  DEBUG <- TRUE
}

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
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

source('pubmed.R')

registerDoParallel(detectCores(all.tests = FALSE, logical = TRUE)-1)
limit = params$limit
.GlobalEnv$VIS_ID <- params$vis_id

failed <- list(params=params)
tryCatch({
  query <- sanitize_query(query)
  input_data = get_papers(query$sanitized_query, params, limit=limit)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Query failed", service, query$raw_query, paste(params, collapse=" "), err, sep="||")))
  failed$query <<- query$raw_query
  failed$query_reason <<- err$message
})

if (exists('input_data')) {
  print(toJSON(input_data$metadata))
  print(toJSON(input_data$text))
} else {
  output_json <- detect_error(failed, service)
  print(output_json)
  print(output_json)
}
