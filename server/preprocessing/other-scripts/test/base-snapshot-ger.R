rm(list = ls())

library(rstudioapi)
library(arsenal)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)

setwd(wd) #Don't forget to set your working directory

query <- "Öffentlichkeit" #args[2]
service <- "base"
params <- NULL
params_file <- "params_base_snapshot-ger.json"

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

#start.time <- Sys.time()

input_data = fromJSON("snapshots/snapshot_base_input-ger.json")

#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken

tryCatch({
output_json = vis_layout(input_data$text, input_data$metadata,
                         max_clusters=MAX_CLUSTERS,
                         lang = LANGUAGE,
                         add_stop_words=ADDITIONAL_STOP_WORDS,
                         testing=TRUE, list_size=100)
}, error=function(err){
tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err, sep="||")))
})

output <- data.frame(fromJSON(output_json))
expected <- fromJSON("snapshots/snapshot_base_expected-ger.json")

summary(compare(output, expected, by="id"))
cmp <- compare(output, expected, by="id")
diffs(cmp, by.var=TRUE)
