rm(list = ls())

args <- commandArgs(TRUE)
wd <- args[1]
query <- args[2]
service <- args[3]
params_file <- args[4]

print(wd)
print(query)
print(service)
print(params_file)

setwd(wd) #Don't forget to set your working directory

source(paste("../other-scripts/vis_layout.R", sep=""))

taxonomy_separator = NULL
limit = 100
list_size = -1
switch(service,
       plos={
         source("../other-scripts/rplos_fast.R")
         taxonomy_separator = "/"
       },
       pubmed={
         source('../other-scripts/pubmed.R')
       },
       doaj={
        source('../other-scripts/doaj.R')
       },
       base={
         source('../other-scripts/base.R')
         limit = 120
         list_size = 100
       },
       openaire={
         source('../other-scripts/openaire.R')
       },
      {
        source("../other-scripts/rplos_fast.R")
      }
)

debug = FALSE

MAX_CLUSTERS = 15
ADDITIONAL_STOP_WORDS = "english"

print("inhere")

if(!is.null(params_file) && !is.na(params_file)) {
  params <- fromJSON(params_file)
} else {
  params <- NULL
}

print("reading stuff")
print(params)

input_data = get_papers(query, params, limit=limit)

print("got the input")

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS, add_stop_words=ADDITIONAL_STOP_WORDS,
                         taxonomy_separator=taxonomy_separator, list_size = list_size)

print(output_json)
