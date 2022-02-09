rm(list = ls())

args <- commandArgs(TRUE)
wd <- args[1]
query <- args[2]
service <- args[3]

setwd(wd) #Don't forget to set your working directory

renv::activate()
renv::restore(lockfile = '../renv.lock')
Sys.setlocale(category="LC_ALL", locale = "en_US.UTF-8")

library(tibble)
library(tidyr)
source('utils.R')
source("vis_layout.R")
if (Sys.getenv("LOGLEVEL") == "DEBUG") {
  DEBUG <- FALSE
} else {
  DEBUG <- TRUE
}

if (DEBUG==TRUE){
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
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

tslog <- getLogger('ts')

f <- file("stdin")
open(f)
data = fromJSON(readLines(f))
params <- data$params
.GlobalEnv$VIS_ID <- params$vis_id

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


input_data <- data$input_data
text <- fromJSON(input_data$text)
metadata <- fromJSON(input_data$metadata)

MAX_CLUSTERS = params$MAX_CLUSTERS
LANGUAGE <- get_service_lang(lang_id, valid_langs, service)
ADDITIONAL_STOP_WORDS = LANGUAGE$name

failed <- list(params=params)
tryCatch({
  output_json = vis_layout(text, metadata,
                           service,
                           max_clusters = MAX_CLUSTERS,
                           add_stop_words = ADDITIONAL_STOP_WORDS,
                           lang = LANGUAGE$name,
                           taxonomy_separator = params$taxonomy_separator,
                           list_size = params$list_size,
                           vis_type=vis_type)
}, error=function(err){
 tslog$error(gsub("\n", " ", paste("Processing failed", query, paste(params, collapse=" "), err, sep="||")))
 failed$query <<- query
 failed$processing_reason <<- err$message
})

if (!exists('output_json')) {
  output_json <- detect_error(failed)
}

print(output_json)
