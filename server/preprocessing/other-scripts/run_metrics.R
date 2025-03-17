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


mlog <- getLogger('metrics_runner')

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

if (!is.null(params$metrics_sources)) {
  metrics_sources <- params$metrics_sources
} else {
  metrics_sources <- c("altmetric", "crossref")
}

source('metrics.R')

registerDoParallel(detectCores(all.tests = FALSE, logical = TRUE)-1)
.GlobalEnv$VIS_ID <- params$vis_id

failed <- list(params=params)
tryCatch({
  if ("doi" %in% names(metadata)) {
    # only enrich metadata with metrics if at least one DOI is present
    if (!all(is.na(metadata$doi))) {
      output <- enrich_metadata_metrics(metadata, metrics_sources)
    }
  } else {
    mlog$warn("No DOIs found in metadata")
  }
}, error=function(err){
  mlog$error(gsub("\n", " ", paste("Metric enrichment failed", service, paste(params, collapse=" "), err, sep="||")))
})

if (exists('output')) {
  print(toJSON(output))
  print(toJSON(output))
} else {
  print(toJSON(metadata))
  print(toJSON(metadata))
}
