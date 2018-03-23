library(xml2)
library(plyr)
library(ropenaire)
library(rcrossref)

# get_papers
#
# Params:
#
# * query: project acronym
# * params: parameters for the search in JSON format: project_id and funding stream
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
  funding_stream <- params$funding_stream

  # identify search on projects
  # project <- roa_projects(acronym = query)
  # project_id <- project$grantID
  # funding_stream <- tolower(project$funding_stream_0)

  # currently not used
  # if funding_stream not as expected, default to fp7
  # if (!(funding_stream %in% c('fp7', 'h2020'))){
  #   funding_stream <- 'fp7'
  # }
  # run searches for publications and data
  # switch according to detected funding stream
  # switch(funding_stream,
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
    response <- roa_pubs(fp7 = project_id, format = 'xml')
    pubs_metadata <- parse_response(response)
    pubs_metadata <- fill_dois(pubs_metadata)
  }, error = function(err){
    print(err)
    pubs_metadata <- data.frame(matrix(nrow=1))
  })

  tryCatch({
    response <- roa_datasets(fp7 = project_id, format = 'xml')
    datasets_metadata <- parse_response(response)
  }, error = function(err) {
    print(err)
    datasets_metadata <- data.frame(matrix(nrow=1))
  })

  tryCatch({
      all_artifacts <- rbind.fill(pubs_metadata, datasets_metadata)
    }, error = function(err){
      print(err)
    }, finally = {
      if (nrow(pubs_metadata) > 0) {
        all_artifacts <- pubs_metadata
      } else if (nrow(datasets_metadata) > 0){
        all_artifacts <- datasets_metadata
      } else {
        all_artifacts <- data.frame(matrix(nrow=1))
      }
    })

  tryCatch({
    get_return_values(all_artifacts)
    }, error = function(err){
      print(err)
      stop(paste("Empty returns, most likely no results found for project_id", project_id))
    })
}

get_return_values <- function(all_artifacts){
  # crude filling
  all_artifacts[is.na(all_artifacts)] <- ""

  text = data.frame(matrix(nrow=nrow(all_artifacts)))
  text$id = all_artifacts$id
  # paste whats available and makes sense
  text$content = paste(all_artifacts$title,
                       all_artifacts$paper_abstract,
                       all_artifacts$subject,
                       all_artifacts$authors,
                       all_artifacts$year,
                       sep = " ")
  ret_val=list("metadata" = all_artifacts, "text" = text)
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
  doi = ".//pid[@classid=\"doi\"]",
  id = ".//result[@objidentifier]"
)

parse_response <- function(response) {
  results <- xml_find_all(response, "//results/result")
  tmp <- lapply(results, function(result){
    lapply(fields, function(field){
      xml_text(xml_find_first(result, field))
    })
  })
  if (!(length(tmp) == 0)) {
    df <- data.frame(data.table::rbindlist(tmp, fill = TRUE, use.names = TRUE))
    df$id <- unlist(lapply(xml_find_all(response, ".//dri:objIdentifier"), xml_text))
    df$year <- unlist(lapply(df$year, function(x){substr(x, 0, 4)}))
    return (df)
  } else {
    stop("Length of results: ", length(tmp))
  }
}

fill_dois <- function(df) {
  missing_doi_indices <- which(is.na(df$doi))
  titles <- df[missing_doi_indices,]$title
  if (debug) {
    print(paste("Missing DOIs:", length(titles)))
    print("Time for filling missing DOIs")
    print(system.time(cr_works(query=queries(titles), async=TRUE)))
  }
  if (length(titles) > 1) {
    response <- cr_works(query=queries(titles), async=TRUE)
    candidates <- lapply(response, function(x){x[1,c('DOI', 'title')]})
    dois <- mapply(check_distance, titles, candidates, USE.NAMES=FALSE)
  } else {
    response <- cr_works(flq=c('query.title'=titles))$data
    dois <- check_distance(titles, response[1,])
  }
  df$doi[c(missing_doi_indices)] <- dois
  return (df)
}

check_distance <- function(title, candidate) {
  sdist <- stringdist(title, candidate$title)
  if (sdist <= 5){
    doi <- candidate$DOI
  } else {
    doi <- ""
  }
  return (doi)
}

queries <- function(titles){
  queries <- c()
  for (title in titles){
    nq <- list('query.title'=title)
    queries <- c(queries, nq)
  }
  return (queries)
}

check_metadata <- function (field) {
  if(!is.null(field)) {
    return (ifelse(is.na(field), '', field))
  } else {
    return ('')
  }
}
