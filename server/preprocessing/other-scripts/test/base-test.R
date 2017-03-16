rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path) 

setwd(wd) #Don't forget to set your working directory

query <- "health issues" #args[2]
service <- "base"
params <- NULL
params_file <- "params_base.json"

source("../vis_layout.R")
source('../base.R')

debug = FALSE

MAX_CLUSTERS = 15
ADDITIONAL_STOP_WORDS = "english"

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

#start.time <- Sys.time()

input_data = get_papers(query, params)

#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS, add_stop_words=ADDITIONAL_STOP_WORDS, testing=TRUE)

print(output_json)