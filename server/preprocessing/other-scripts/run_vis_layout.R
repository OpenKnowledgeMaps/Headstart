rm(list = ls())

args <- commandArgs(TRUE)
wd <- args[1]
query <- args[2]
service <- args[3]

setwd(wd) #Don't forget to set your working directory

renv::activate()
renv::restore(lockfile = '../renv.lock')
Sys.setlocale(category="LC_ALL", locale = "en_US.UTF-8")

library(tibble)
library(tidyr)
source('utils.R')
source("vis_layout.R")
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
.GlobalEnv$VIS_ID <- params$vis_id

if (!is.null(params$lang_id)) {
  lang_id <- params$lang_id
} else {
  lang_id <- 'all'
}

if (!is.null(params$vis_type)) {
  vis_type <- params$vis_type
} else {
  vis_type <- 'overview'
}


input_data <- data$input_data
text <- fromJSON(input_data$text)
metadata <- fromJSON(input_data$metadata)

MAX_CLUSTERS = params$MAX_CLUSTERS

failed <- list(params=params)
tryCatch({
  output_json = vis_layout(text, metadata,
                           service,
                           max_clusters = MAX_CLUSTERS,
                           taxonomy_separator = params$taxonomy_separator,
                           vis_type=vis_type, list_size = params$list_size,
                           params=params)
}, error=function(err){
 tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err, sep="||")))
 failed$query <<- query
 failed$processing_reason <<- err$message
})

if (!exists('output_json')) {
  output_json <- detect_error(failed)
}

print(output_json)
