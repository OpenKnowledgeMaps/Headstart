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

if ("q_advanced" %in% names(params)) {
  params$q_advanced <- sanitize_query(params$q_advanced)$sanitized_query
}

.GlobalEnv$VIS_ID <- params$vis_id
taxonomy_separator = NULL
limit = 100
switch(service,
       pubmed={
         source('../other-scripts/pubmed.R')
         params$limit = 100
         params$list_size = 100
       },
       base={
         source('../other-scripts/base.R')
         params$limit = 120
         params$list_size = 100
       },
       openaire={
         source('../other-scripts/openaire.R')
         params$list_size = -1
       }
)

MAX_CLUSTERS = 15

failed <- list(params=params)
tryCatch({
  query <- sanitize_query(query)
  input_data = get_papers(query$sanitized_query, params)
}, error=function(err){
  tslog$error(gsub("\n", " ", paste("Query failed", service, query$raw_query, paste(params, collapse=" "), err, sep="||")))
  failed$query <<- query$raw_query
  failed$query_reason <<- err$message
})

if(exists('input_data')) {
  tryCatch({
    output_json = vis_layout(input_data$text, input_data$metadata,
                             service,
                             max_clusters=MAX_CLUSTERS,
                             taxonomy_separator=taxonomy_separator,
                             vis_type=vis_type, list_size = params$list_size)
  }, error=function(err){
   tslog$error(gsub("\n", " ", paste("Processing failed", query$raw_query, paste(params, collapse=" "), err, sep="||")))
   failed$query <<- query$raw_query
   failed$processing_reason <<- err$message
  })
}

if (!exists('output_json')) {
  output_json <- detect_error(failed, service, params)
} else if (service=='openaire' && exists('output_json')) {
  output_json <- enrich_output_json(output_json)
}

print(output_json)
