rm(list = ls())

args <- commandArgs(TRUE)
wd <- args[1]
setwd(wd) #Don't forget to set your working directory

renv::activate()
renv::restore(lockfile = '../renv.lock')
Sys.setlocale(category="LC_ALL", locale = "en_US.UTF-8")

library(jsonlite)
library(rbace)
library(logging)

source('utils.R')
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

log <- getLogger('base_repos')

failed <- list()
failed$status <- 'error'

tryCatch({
  contentproviders <- bs_repositories("")
  if (is.null(contentproviders) || nrow(contentproviders) == 0) {
    stop("No content providers retrieved.")
  }
  triple <- list(name = "GoTriple", internal_name = "fttriple")
  contentproviders <- rbind(contentproviders, triple)
}, error = function(err) {
  log$error(paste("Content provider retrieval failed", "base", "retrieve_contentproviders", "", err, sep = "||"))
  failed$reason <- list(err$message)
})


if (exists('contentproviders')) {
  print(toJSON(contentproviders))
} else {
  print(toJSON(failed))
}
