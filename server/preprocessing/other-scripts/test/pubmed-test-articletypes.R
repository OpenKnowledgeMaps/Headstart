rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)
setwd(wd) #Don't forget to set your working directory

query <- "cancer" #args[2]
service <- "pubmed"
params <- NULL
params_file <- "params_pubmed_articletypes.json"

source('../utils.R')
DEBUG = FALSE

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

tslog <- getLogger('ts')

source("../vis_layout.R")
source('../pubmed.R')

MAX_CLUSTERS = 15

if(!is.null(params_file)) {
  params <- fromJSON(params_file)
}

if ('lang_id' %in% names(params)){
    lang_id <- params$lang_id
  } else {
    lang_id <- 'all'
}

LANGUAGE <- get_service_lang(lang_id, valid_langs, service)
ADDITIONAL_STOP_WORDS = LANGUAGE$name


check_article_type <- function(article_type_string) {
  # article_type_string <- "Comparative Study; Evaluation Study; Journal Article"
  # -> "comparative study; evaluation study; journal article"
  # -> [1] "comparative study" "evaluation study"  "journal article"
  # -> [1]  TRUE FALSE FALSE
  # -> [1]  TRUE if any
  any(unlist(lapply(strsplit(tolower(article_type_string), "; "), function(x) x %in% params$article_types)))
}

article_types_orig <- params$article_types

for (at in article_types_orig) {
  #start.time <- Sys.time()
  params$article_types <- at
  failed <- list(params=params)
  tryCatch({
    input_data = get_papers(query, params)
  }, error=function(err){
    tslog$error(gsub("\n", " ", paste("Query failed", service, query, paste(params, collapse=" "), err, sep="||")))
    failed$query <<- query
    failed$query_reason <<- err$message
  })
  article_types <- input_data$metadata$publication_type
  valid <- unlist(lapply(article_types, check_article_type))
  if (length(article_types[!valid]) > 0) {
    print(paste(length(article_types[!valid]), "unexpected article types for", at))
  }
}
