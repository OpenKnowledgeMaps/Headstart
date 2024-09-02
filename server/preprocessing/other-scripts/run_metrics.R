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
if ("q_advanced" %in% names(params)) {
  params$q_advanced <- sanitize_query(params$q_advanced)$sanitized_query
}
metadata <- fromJSON(data$metadata)


if (!is.null(params$lang_id)) {
  lang_id <- params$lang_id
} else {
  lang_id <- 'all'
}

source("utils.R")
source('metrics.R')

registerDoParallel(detectCores(all.tests = FALSE, logical = TRUE)-1)
.GlobalEnv$VIS_ID <- params$vis_id

failed <- list(params=params)
tryCatch({
  metadata <- enrich_metadata_metrics(metadata)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Metric enrichment failed", service, paste(params, collapse=" "), err, sep="||")))
  failed$query <<- params$q
  failed$query_reason <<- err$message
})

if (exists('metadata')) {
  print(toJSON(metadata))
  print(toJSON(metadata))
} else {
  output_json <- detect_error(failed, service, params)
  print(output_json)
  print(output_json)
}
