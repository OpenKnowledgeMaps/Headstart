rm(list = ls())

#args <- commandArgs(TRUE)
wd <-"" #args[1]
query <- "frogs" #args[2]
service <- "plos"
params_file <- singleString <- paste(readLines("test/params.json"), collapse=" ") #args[3]
setwd(wd) #Don't forget to set your working directory

source("vis_layout.R")

switch(service, 
       plos={
         source("rplos_fast.R")
       },
       pubmed={
         print('pubmed')    
       },
    {
      source("rplos_fast.R")
    }
)

debug = FALSE

MAX_CLUSTERS = 15

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

input_data = get_papers(query, params)

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS)

print(output_json)