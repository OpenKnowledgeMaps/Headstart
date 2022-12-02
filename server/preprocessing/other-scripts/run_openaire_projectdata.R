rm(list = ls())

args <- commandArgs(TRUE)
wd <- args[1]
project_id <- args[2]
funder <- args[3]
setwd(wd) #Don't forget to set your working directory

renv::activate()
renv::restore(lockfile = '../renv.lock')
Sys.setlocale(category="LC_ALL", locale = "en_US.UTF-8")

library(jsonlite)
library(ropenaire)
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


log <- getLogger('openaire_projects')

tryCatch({
  project_data <- ropenaire::roa_projects(project_id, funder=funder)
}, error=function(err){
  log$error(paste("Project data retrieval failed", "openaire", "retrieve_projectdata", "", err, sep="||"))
  failed <- list()
  failed$reason <- list(err)
  failed$status <- 'error'
})


if (exists('project_data')) {
  print(toJSON(project_data))
} else {
  print(toJSON(failed))
}
