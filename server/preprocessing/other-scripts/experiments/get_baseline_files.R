library(jsonlite)
library(logging)
basicConfig(level='INFO')
addHandler(writeToFile, file="getting_baseline_files.log", level='INFO')



wd <- tryCatch(dirname(rstudioapi::getActiveDocumentContext()$path),
               error = function(e) {
                                  logerror('%s', e)
                                  wd <<- getwd()
               }
)
setwd(wd)

top_terms <- read.csv("topterms.csv", header=TRUE, stringsAsFactors=FALSE)
service <- "pubmed"
if (service == "pubmed"){source('../pubmed.R')}
if (service == "pubmed"){params_file <- "../test/params_pubmed.json"}
if (service == "doaj"){source('../doaj.R')}
if (service == "doaj"){params_file <- "../test/params_doaj.json"}
params <- fromJSON(params_file)
for (query in top_terms$Term) {
  if(file.exists(paste("baseline/baseline", service, query, sep="_"))) next
  papers = tryCatch(get_papers(query, params=params),
                    error = function(e) {logerror('%s %s %s', query, service, e)}
                    )
  json = toJSON(papers)
  file_handle = file(paste("baseline/baseline", service, query, sep="_"), open="w")
  write(json, file_handle)
}

service <- "doaj"
if (service == "pubmed"){source('../pubmed.R')}
if (service == "pubmed"){params_file <- "../test/params_pubmed.json"}
if (service == "doaj"){source('../doaj.R')}
if (service == "doaj"){params_file <- "../test/params_doaj.json"}
params <- fromJSON(params_file)
for (query in top_terms$Term) {
  if(file.exists(paste("baseline/baseline", service, query, sep="_"))) next
  papers = tryCatch(get_papers(query, params=params),
                    error = function(e) {logerror('%s %s %s', query, service, e)}
                    )
  json = toJSON(papers)
  file_handle = file(paste("baseline/baseline", service, query, sep="_"), open="w")
  write(json, file_handle)
}