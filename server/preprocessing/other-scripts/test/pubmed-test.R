rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path) 

setwd(wd) #Don't forget to set your working directory

query <- "health" #args[2]
service <- "pubmed"
params <- NULL
params_file <- "params_pubmed.json"

source("../vis_layout.R")
source('../pubmed.R')

debug = FALSE

MAX_CLUSTERS = 15

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

#start.time <- Sys.time()

input_data = get_papers(query, params)

#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS)

print(output_json)