library(ropenaire)
library(plyr)

# get_papers
#
# Params:
#
# * query: project acronym
# * params: parameters for the search in JSON format: call_id and funding stream
# * limit: number of search results to return
#
# It is expected that get_papers returns a list containing two data frames named "text" and "metadata"
#
# "text" contains the text for similarity analysis; it is expected to have two columns "id" and "content"
#
# "metadata" contains all metadata; its columns are expected to be named as follows:
# * "id": a unique ID, preferably the DOI
# * "title": the title
# * "authors": authors, preferably in the format "LASTNAME1, FIRSTNAME1;LASTNAME2, FIRSTNAME2"
# * "paper_abstract": the abstract
# * "published_in": name of the journal or venue
# * "year": publication date
# * "url": URL to the landing page
# * "readers": an indicator of the paper's popularity, e.g. number of readers, views, downloads etc.
# * "subject": keywords or classification, split by ;


get_papers <- function(query, params) {
  # parse params
  grant_id <- params$grant_id
  call_id <- params$call_id

  # identify search on projects
  # project <- roa_projects(acronym = query)
  # grant_id <- project$grantID
  # funding_stream <- tolower(project$funding_level_0)

  # currently not used
  # if funding_stream not as expected, default to fp7
  # if (!(funding_stream %in% c('fp7', 'h2020'))){
  #   funding_stream <- 'fp7'
  # }
  # run searches for publications and data
  # switch according to detected funding stream
  # switch(funding_stream,
  #   fp7 = {
  #     pubs <- roa_pubs(fp7 = grant_id, format = 'json')
  #     datasets <- roa_datasets(fp7 = grant_id, format = 'json')
  #   },
  #   h2020 = {
  #     pubs <- roa_pubs(h2020 = grant_id, format = 'json')
  #     datasets <- roa_datasets(h2020 = grant_id, format = 'json')
  #   }
  # )
  pubs <- roa_pubs(fp7 = grant_id, format = 'json')
  datasets <- roa_datasets(fp7 = grant_id, format = 'json')

  pubs_md <- pubs$response$results$result$metadata$`oaf:entity`$`oaf:result`
  pubs_metadata <- build_pubs_metadata(pubs_md)

  if (!is.null(nrow(datasets))){
    datasets_md <- datasets$response$results$result$metadata$`oaf:entity`$`oaf:result`
    datasets_metadata <- build_datasets_metadata(datasets_md)
    all_artifacts <- rbind.fill(pubs_metadata, datasets_metadata)
  } else {
    all_artifacts <- pubs_metadata
  }
  text = data.frame(matrix(nrow=length(all_artifacts$id)))
  text$id = all_artifacts$id
  # paste whats available and makes sense
  text$content = paste(all_artifacts$title,
                       all_artifacts$paper_abstract,
                       all_artifacts$subject,
                       all_artifacts$authors,
                       all_artifacts$year,
                      sep = " ")
  ret_val=list("metadata" = all_artifacts, "text"=text)
  return (ret_val)
}


build_datasets_metadata <- function(datasets_md){
  metadata = data.frame(matrix(nrow=nrow(datasets_md)))
  metadata$title = check_metadata(datasets_md$title$`$`)
  metadata$language = check_metadata(datasets_md$language$'@classname')
  metadata$authors = unlist(check_metadata(
                        lapply(datasets_md$creator,
                               function(x){paste(x$'$', collapse=", ")})))
  metadata$resulttype = check_metadata(datasets_md$resulttype$'@classid')
  metadata$publisher = check_metadata(datasets_md$publisher$`$`)
  metadata$paper_abstract = check_metadata(datasets_md$description)
  metadata$id = unlist(check_metadata(lapply(datasets_md$pid, extract_doi)))
  metadata$year = check_metadata(datasets_md$dateofacceptance$`$`)
  return (metadata)
}


build_pubs_metadata <- function(pubs_md) {
  metadata = data.frame(matrix(nrow=nrow(pubs_md)))
  tryCatch({
      metadata$url = check_metadata(pubs_md$fulltext$'$')
    }, error = function(err){
    }, finally = {
      metadata$url = ''
    }
    )
  metadata$title = check_metadata(pubs_md$title$`$`)
  tryCatch({
    metadata$subject = unlist(check_metadata(
      lapply(pubs_md$subject,
             function(x){paste(x$'$', collapse=", ")})))
  }, error = function(err){
  }, finally = {
    metadata$subject = ''
  }
  )
  metadata$authors = unlist(check_metadata(
                        lapply(pubs_md$creator,
                               function(x){paste(x$'$', collapse=", ")})))
  metadata$paper_abstract = check_metadata(pubs_md$description$`$`)
  metadata$published_in = check_metadata(pubs_md$journal$`$`)
  metadata$language = check_metadata(pubs_md$language$'@classname')
  metadata$publisher = check_metadata(pubs_md$publisher$`$`)
  metadata$year = check_metadata(pubs_md$dateofacceptance$`$`)
  metadata$id = unlist(check_metadata(lapply(pubs_md$pid, extract_doi)))
  metadata$resulttype = check_metadata(pubs_md$resulttype$'@classid')
  return (metadata)
}


check_metadata <- function (field) {
  if(!is.null(field)) {
    return (ifelse(is.na(field), '', field))
  } else {
    return ('')
  }
}

extract_doi <- function(pid){
  doi_ind = which(pid$'@classid' == 'doi')
  doi = pid$'$'[doi_ind]
  if (is.null(doi)){
    doi = ''
  }
  return (doi)
}
