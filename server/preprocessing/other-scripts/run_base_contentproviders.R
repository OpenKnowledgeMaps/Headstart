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

tryCatch({
  contentproviders <- bs_repositories("")
}, error=function(err){
  log$error(paste("Contentprovider failed", "base", "retrieve_contentproviders", "", err, sep="||"))
  failed <- list()
  failed$reason <- list(err)
  failed$status <- 'error'
})


if (exists('contentproviders')) {
  print(toJSON(contentproviders))
} else {
  print(toJSON(failed))
}
