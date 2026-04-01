rm(list = ls())

args <- commandArgs(TRUE)
wd <- args[1]
setwd(wd)

renv::activate()
renv::restore(lockfile = '../renv.lock')
Sys.setlocale(category = "LC_ALL", locale = "en_US.UTF-8")

library(jsonlite)
library(rbace)
library(logging)

source('utils.R')
if (Sys.getenv("LOGLEVEL") == "DEBUG") {
  DEBUG <- FALSE
} else {
  DEBUG <- TRUE
}

if (DEBUG == TRUE) {
  setup_logging('DEBUG')
} else {
  setup_logging('INFO')
}

log <- getLogger('update_contentproviders')

output_path <- if (length(args) >= 2) args[2] else {
  file.path(wd, "../../workers/common/common/contentproviders.json")
}
output_path <- normalizePath(output_path, mustWork = FALSE)

tryCatch({
  contentproviders <- bs_repositories("")
  if (is.null(contentproviders) || nrow(contentproviders) == 0) {
    stop("No content providers retrieved.")
  }
  triple <- list(name = "GoTriple", internal_name = "fttriple")
  contentproviders <- rbind(contentproviders, triple)

  write(toJSON(contentproviders), file = output_path)
  log$info(paste("contentproviders.json updated:", output_path,
                 "—", nrow(contentproviders), "entries"))
}, error = function(err) {
  log$error(paste("Content provider update failed", "base",
                  "update_contentproviders", "", err, sep = "||"))
  quit(status = 1)
})
