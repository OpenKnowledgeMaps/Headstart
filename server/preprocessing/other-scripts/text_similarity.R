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

source('../other-scripts/utils.R')
DEBUG = FALSE

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

tslog <- getLogger('ts')

source(paste("../other-scripts/vis_layout.R", sep=""))
source('../other-scripts/altmetrics.R')


if(!is.null(params_file) && !is.na(params_file)) {
  params <- fromJSON(params_file)
} else {
  params <- NULL
}

if (!is.null(params$lang_id)) {
    lang_id <- params$lang_id
  } else {
    lang_id <- 'all'
}

taxonomy_separator = NULL
limit = 100
list_size = -1
vis_type = ifelse(params$vis_type=='timeline', 'timeline', 'overview')
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
       linkedcat={
         source('../other-scripts/linkedcat.R')
         limit = ifelse(vis_type=='timeline', 9999, 100)
       },
       linkedcat_authorview={
         source('../other-scripts/linkedcat_authorview.R')
         limit = 500
       },
       linkedcat_browseview={
         source('../other-scripts/linkedcat_browseview.R')
         limit = 500
       },
      {
        source("../other-scripts/rplos_fast.R")
      }
)

print("inhere")

MAX_CLUSTERS = 15
LANGUAGE <- get_service_lang(lang_id, valid_langs, service)
ADDITIONAL_STOP_WORDS = LANGUAGE$name

print("reading stuff")
print(params)
failed <- list(params=params)
tryCatch({
  input_data = get_papers(query, params, limit=limit)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Query failed", service, query, paste(params, collapse=" "), err, sep="||")))
  failed$query <<- query
  failed$query_reason <<- err$message
})


print("got the input")
tryCatch({
  output_json = vis_layout(input_data$text, input_data$metadata,
                           service,
                           max_clusters=MAX_CLUSTERS, add_stop_words=ADDITIONAL_STOP_WORDS,
                           lang=LANGUAGE$name,
                           taxonomy_separator=taxonomy_separator, list_size = list_size,
                           vis_type=vis_type)
}, error=function(err){
 tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err, sep="||")))
 failed$query <<- query
 failed$processing_reason <<- err$message
})

if (service=='openaire' && exists('output_json')) {
  output_json = enrich_output_json(output_json)
}

if (!exists('output_json')) {
  output_json <- detect_error(failed)
}

print(output_json)
