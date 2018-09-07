rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)

setwd(wd) #Don't forget to set your working directory

query <- "Kommissionsbericht" #args[2]
service <- "linkedcat"
params <- NULL
params_file <- "params_linkedcat.json"

source('../utils.R')
source("../vis_layout.R")
source('../linkedcat.R')

DEBUG = FALSE

MAX_CLUSTERS = 15
ADDITIONAL_STOP_WORDS = "german"

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

#start.time <- Sys.time()

input_data = get_papers(query, params)

#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS,
                         add_stop_words=ADDITIONAL_STOP_WORDS, testing=TRUE, list_size=100)

print(output_json)
