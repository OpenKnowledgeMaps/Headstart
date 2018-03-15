library(ropenaire)
library(plyr)
library(xml2)

# get_papers
#
# Params:
#
# * query: project acronym
# * params: parameters for the search in JSON format: funding_level and funding stream
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


get_papers <- function(query, params, limit=NULL) {
  # parse params
  project_id <- params$project_id
  funding_level <- params$funding_level

  # identify search on projects
  # project <- roa_projects(acronym = query)
  # project_id <- project$grantID
  # funding_level <- tolower(project$funding_level_0)

  # currently not used
  # if funding_level not as expected, default to fp7
  # if (!(funding_level %in% c('fp7', 'h2020'))){
  #   funding_level <- 'fp7'
  # }
  # run searches for publications and data
  # switch according to detected funding stream
  # switch(funding_level,
  #   fp7 = {
  #     pubs <- roa_pubs(fp7 = project_id, format = 'json')
  #     datasets <- roa_datasets(fp7 = project_id, format = 'json')
  #   },
  #   h2020 = {
  #     pubs <- roa_pubs(h2020 = project_id, format = 'json')
  #     datasets <- roa_datasets(h2020 = project_id, format = 'json')
  #   }
  # )

  tryCatch({
    pubs_metadata <- parse_response(roa_pubs(fp7 = project_id, format = 'xml'))
  }, error = function(err){
    print(err)
  }, finally = {
    pubs_metadata <- data.frame(matrix(nrow=1))
  })

  tryCatch({
    datasets_metadata <- parse_response(roa_datasets(fp7 = project_id, format = 'xml'))
  }, error = function(err) {
    print(err)
  }, finally = {
    datasets_metadata <- data.frame(matrix(nrow=1))
  })

  tryCatch({
      all_artifacts <- rbind.fill(pubs_metadata, datasets_metadata)
    }, error = function(err){
      print(err)
    }, finally = {
      all_artifacts <- pubs_metadata
    })


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


fields <- c(
  subject = ".//subject",
  title = ".//title",
  authors = ".//creator",
  year = ".//dateofacceptance",
  publisher = ".//publisher",
  resulttype = ".//resulttype",
  language = ".//language",
  journal = ".//journal",
  url = ".//fulltext",
  paper_abstract = ".//description",
  id = ".//originalId",
  doi = ".//pid[@schemeid=\"doi\"]"
)

parse_response <- function(xml) {
  results <- xml_find_all(xml, "//result")
  tmp <- lapply (results, function(res){
    lapply(fields, function(field){
      xml_text(xml_find_first(res, field))
    })
  })
  df <- data.frame(data.table::rbindlist(tmp, fill = TRUE, use.names = TRUE))
  return (df)
}


check_metadata <- function (field) {
  if(!is.null(field)) {
    return (ifelse(is.na(field), '', field))
  } else {
    return ('')
  }
}
