rm(list = ls())

library(rstudioapi)

get_script_path <- function() {
  cmdArgs = commandArgs(trailingOnly = FALSE)
  needle = "--file="
  match = grep(needle, cmdArgs)
  if (length(match) > 0) {
    # Rscript
    return(normalizePath(sub(needle, "", cmdArgs[match])))
  } else {
    ls_vars = ls(sys.frames()[[1]])
    if ("fileName" %in% ls_vars) {
      # Source'd via RStudio
      return(normalizePath(sys.frames()[[1]]$fileName)) 
    } else {
      # Source'd via R console
      return(normalizePath(sys.frames()[[1]]$ofile))
    }
  }
}

#args <- commandArgs(TRUE)
wd <-"C:/Users/pkraker/xampp/htdocs/project-website/search_plos/server/preprocessing/other-scripts/"

setwd(wd) #Don't forget to set your working directory

query <- "frogs" #args[2]
service <- "plos"
params_file <- singleString <- paste(readLines("test/params.json"), collapse=" ") #args[3]


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

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

#start.time <- Sys.time()

#Format for fq: article_type:("Review" OR "Editorial")'

input_data = get_papers(query, params)

#end.time <- Sys.time()
#time.taken <- end.time - start.time
#time.taken

output_json = vis_layout(input_data$text, input_data$metadata, max_clusters=MAX_CLUSTERS)

print(output_json)