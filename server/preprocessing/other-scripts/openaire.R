library(ropenaire)

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
  funding_stream <- params$funding_stream
  call_id <- params$call_id
  # run searches
  pubs <- roa_pubs(funding_stream = query, format='json')
  datasets = roa_datasets(funding_stream = query, format='json')
  all_artifacts <- rbind(pubs, datasets)

  # run searches for publications and data
  pubs <- roa_pubs(fp7 = query, format='json')
  datasets = roa_datasets(fp7 = query, format='json')
  pubs_md <- pubs$response$results$result$metadata$`oaf:entity`$`oaf:result`
  datasets_md <- datasets$response$results$result$metadata$`oaf:entity`$`oaf:result`

  pubs_md <- data.frame(matrix(nrow=length(pubs_md)))


  metadata$title = check_metadata(all_artifacts$Title)
  metadata$subject = check_metadata(all_artifacts$subject)
  metadata$paper_abstract = check_metadata(all_artifacts$response$results$result$metadata$`oaf:entity`$`oaf:result`$description)
  metadata$published_in = check_metadata(all_artifacts$Journal)
  metadata$year = check_metadata(all_artifacts$`Publication Year`)



  text = data.frame(matrix(nrow=length(all_artifacts$DOI)))
  text$id = metadata$id
  # paste whats available and makes sense
  text$content = paste(metadata$title,
                       sep = " ")
  ret_val=list("metadata" = metadata, "text"=text)
  return (ret_val)
}


build_pubs_metadata <- function(pubs_md) {
  metadata = data.frame(matrix(nrow=nrow(pubs_md)))
  metadata$id = check_metadata(all_artifacts$DOI)
  metadata$url = check_metadata(pubs_md$fulltext)

  metadata$title = check_metadata(pubs_md$title$`$`)
  metadata$subject = check_metadata(
                        lapply(pubs_md$subject,
                               function(x){paste(x$'$', collapse=", ")}))
  metadata$authors = check_metadata(
                        lapply(pubs_md$creator,
                               function(x){paste(x$'$', collapse=", ")}))
  metadata$paper_abstract = check_metadata(pubs_md$description)
  metadata$published_in = check_metadata(pubs_md$journal$`$`)
  metadata$year = check_metadata(all_artifacts$`Publication Year`)
  metadata$language = check_metadata(pubs_md$language$'@classname')
  metadata$publisher = check_metadata(pubs_md$publisher)
  return (metadata)
}


check_metadata <- function (field) {
  if(!is.null(field)) {
    return (ifelse(is.na(field), '', field))
  } else {
    return ('')
  }
}
