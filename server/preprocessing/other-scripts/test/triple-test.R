rm(list = ls())

library(rstudioapi)

options(warn=1)

wd <- dirname(rstudioapi::getActiveDocumentContext()$path)
setwd(wd)

input_file <- "triple_test_input_data.json"
params_file <- "params_triple.json"
query <- "machine learning"
service <- "triple"

source('../utils.R')

DEBUG <- TRUE
if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

source("../vis_layout.R")

tslog <- getLogger('ts')

params <- fromJSON(params_file)
input_data <- fromJSON(input_file)
text <- fromJSON(input_data$text)
metadata <- fromJSON(input_data$metadata)

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


valid_langs <- list(
  'afr'='afrikaans',
  'akk'='akkadian',
  'ara'='arabic',
  'baq'='basque',
  'bel'='belarusian',
  'chi'='chinese',
  'cze'='czech',
  'dan'='danish',
  'dut'='dutch',
  'eng'='english',
  'est'='estonian',
  'fin'='finnish',
  'fre'='french',
  'geo'='georgian',
  'ger'='german',
  'gle'='irish',
  'glg'='galician',
  'grc'='greek',
  'gre'='greek',
  'heb'='hebrew',
  'hrv'='croatian',
  'hun'='hungarian',
  'ice'='icelandic',
  'ind'='indonesian',
  'ita'='italian',
  'jpn'='japanese',
  'kor'='korean',
  'lat'='latin',
  'lit'='lithuanian',
  'nau'='nauru',
  'nob'='norwegian',
  'nor'='norwegian',
  'ota'='turkish',
  'per'='persian',
  'pol'='polish',
  'por'='portuguese',
  'rum'='romanian',
  'rus'='russian',
  'slo'='slovak',
  'slv'='slovenian',
  'spa'='spanish',
  'srp'='serbian',
  'sux'='sumerian',
  'swe'='swedish',
  'tha'='thai',
  'tur'='turkish',
  'ukr'='ukrainian',
  'vie'='vietnamese'
)

MAX_CLUSTERS = params$MAX_CLUSTERS
LANGUAGE <- get_service_lang(lang_id, valid_langs, service)
ADDITIONAL_STOP_WORDS = LANGUAGE$name

tslog <- getLogger('ts')

failed <- list(params=params)
tryCatch({
  output_json = vis_layout(text, metadata,
                           service,
                           max_clusters = MAX_CLUSTERS,
                           add_stop_words = ADDITIONAL_STOP_WORDS,
                           testing=TRUE,
                           lang = LANGUAGE$name,
                           taxonomy_separator = params$taxonomy_separator,
                           list_size = params$list_size,
                           vis_type=vis_type)
}, error=function(err){
 tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err, sep="||")))
 failed$query <<- query
 failed$processing_reason <<- err$message
})
