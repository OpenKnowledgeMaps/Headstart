rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)

setwd(wd) #Don't forget to set your working directory

query <- "Öffentlichkeit" #args[2]
service <- "base"
params <- NULL
params_file <- "params_base_ger.json"

source("../vis_layout.R")
source('../base.R')

debug = FALSE

MAX_CLUSTERS = 15

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

if ('language' %in% names(params)){
  language = params$language
  if (language == 'all'){
    language == 'english'
  }
} else {
  language <- 'english'
}

#start.time <- Sys.time()

ADDITIONAL_STOP_WORDS = language
input_data = get_papers(query, params, limit=120)

#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken

output_json = vis_layout(input_data$text, input_data$metadata,
                         max_clusters = MAX_CLUSTERS,
                         language = language,
                         add_stop_words = ADDITIONAL_STOP_WORDS,
                         testing=TRUE, list_size=100)

print(output_json)
