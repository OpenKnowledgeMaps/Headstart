rm(list = ls())

args <- commandArgs(TRUE)
wd <- args[1]
query <- args[2]
service <- args[3]
params_file <- args[4]

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

if (!is.null(params$vis_type)) {
    vis_type <- params$vis_type
  } else {
    vis_type <- 'overview'
}

.GlobalEnv$VIS_ID <- params$vis_id
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

MAX_CLUSTERS = 15
LANGUAGE <- get_service_lang(lang_id, valid_langs, service)
ADDITIONAL_STOP_WORDS = LANGUAGE$name

failed <- list(params=params)
tryCatch({
  query <- sanitize_query(query)
  input_data = get_papers(query$sanitized_query, params, limit=limit)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Query failed", service, query$raw_query, paste(params, collapse=" "), err, sep="||")))
  failed$query <<- query$raw_query
  failed$query_reason <<- err$message
})

if(exists('input_data')) {
  tryCatch({
    output_json = vis_layout(input_data$text, input_data$metadata,
                             service,
                             max_clusters=MAX_CLUSTERS, add_stop_words=ADDITIONAL_STOP_WORDS,
                             lang=LANGUAGE$name,
                             taxonomy_separator=taxonomy_separator, list_size = list_size,
                             vis_type=vis_type)
  }, error=function(err){
   tslog$error(gsub("\n", " ", paste("Processing failed", query$raw_query, paste(params, collapse=" "), err, sep="||")))
   failed$query <<- query$raw_query
   failed$processing_reason <<- err$message
  })
}

if (!exists('output_json')) {
  output_json <- detect_error(failed, service)
} else if (service=='openaire' && exists('output_json')) {
  output_json <- enrich_output_json(output_json)
}

print(output_json)
