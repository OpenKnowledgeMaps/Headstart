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

source("vis_layout.R")

switch(service, 
       plos={
         source("rplos_fast.R")
       },
       pubmed={
         source('pubmed.R')    
       },
      {
        source("rplos_fast.R")
      }
)

debug = FALSE

MAX_CLUSTERS = 15

print("inhere")

if(!is.null(params_file) && !is.na(params_file)) {
  params <- fromJSON(params_file)
} else {
  params <- NULL
}

print("reading stuff")
print(params)

input_data = get_papers(query, params)

print("got the input")

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS)

print(output_json)