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


log <- getLogger('openaire_projectdata')

params=list(project_id=project_id,
            funder=funder)

projectdata_nodes <- c(
  grantID = ".//code",
  acronym = ".//acronym",
  title = ".//title",
  start_date = ".//startdate",
  end_date = ".//enddate",
  call_id = ".//callidentifier",
  special_clause = ".//ecsc39",
  funding_level_0 = ".//funding_level_0/name",
  oa_mandate = ".//oamandatepublications",
  obj_id = ".//header/dri:objIdentifier",
  openaire_link = ".//websiteurl"
)

orgdata_nodes <- c(
  name = ".//rels/rel/legalshortname",
  long_name = ".//rels/rel/legalname",
  website = ".//rels/rel/websiteurl",
  org_id = ".//rels/rel/to"
)

fundingtree_nodes <- c(
  funding_level_2 = ".//fundingtree//funding_level_2/name",
  funding_level_1 = ".//fundingtree//funding_level_1/name",
  funding_level_0 = ".//fundingtree//funding_level_0/name"
)

`%|m|%` <- function(x, y) {
  if (length(x) == 0) return(y)
  if (is.null(x) || !nzchar(x)) y else x
}

extract_metadata <- function(xml, nodes) {
  lapply(xml, function(z) {
    lapply(nodes, function(w) {
      xml2::xml_text(xml2::xml_find_all(z, w))[1] %|m|% NA_character_
    })
  })
}

parse_project <- function(raw_xml) {
  parsed_xml <- xml2::read_xml(raw_xml)
  result <- xml2::xml_find_all(parsed_xml, xpath = '//results/result')
  projectdata <- extract_metadata(result, projectdata_nodes)
  projectdata <- as.list(data.frame(projectdata))
  projectdata[is.na(projectdata)] <- ""
  fundingtree <- unname(unlist(extract_metadata(result, fundingtree_nodes)))
  orgdata <- data.frame(extract_metadata(result, orgdata_nodes))
  orgdata["org_id"] <- lapply(orgdata["org_id"], function(x) {paste0("https://www.openaire.eu/search/organization?organizationId=", x)})
  orgdata["url"] <- ifelse(is.na(orgdata$website), orgdata$org_id, orgdata$website)
  projectdata$organisations <- orgdata
  projectdata$funding_tree <- fundingtree
  return (projectdata)
}

failed <- list(params=params)

tryCatch({
  raw_xml <- ropenaire::roa_projects(project_id, funder=funder, format="xml", raw=TRUE)
  projectdata <- parse_project(raw_xml)
}, error=function(err){
  log$error(paste("Project data retrieval failed", "openaire", "retrieve_projectdata", "", paste0(err), sep="||"))
  failed$query <<- project_id
  failed$query_reason <<- 'Project not found.'
})


if (exists('projectdata')) {
  print(toJSON(projectdata, auto_unbox=T))
} else {
  print(detect_error(failed, "openaire", params))
}
