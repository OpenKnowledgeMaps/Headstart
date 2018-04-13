library(xml2)
library(plyr)
library(ropenaire)
library(rcrossref)

# get_papers
#
# Params:
#
# * query: project acronym
# * params: parameters for the search in JSON format: project_id and funder
#           where funder one of WT | EC | ARC | ANDS | NSF | FCT | NHMRC
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
# * "oa_state": indicating the open access status of the item (0 = closed access, 1 = open access, 2 = unknown)
# * "link": link to the open access PDF or a landing page linking to the PDF

get_papers <- function(query, params, limit=NULL) {
  # parse params
  project_id <- params$project_id
  funder <- params$funder

  pubs_metadata <- tryCatch({
    response <- roa_pubs(project_id = project_id,
                         funder = funder,
                         format = 'xml')
    pubs_metadata <- parse_response(response)
    pubs_metadata <- fill_dois(pubs_metadata)
  },
  error = function(err){
    print(paste0("publications: ", err))
    pubs_metadata <- data.frame()
    return (data.frame())
  })

  datasets_metadata <- tryCatch({
    response <- roa_datasets(project_id = project_id,
                             funder = funder,
                             format = 'xml')
    datasets_metadata <- parse_response(response)
  },
  error = function(err){
    print(paste0("datasets: ", err))
    datasets_metadata <-
    return (data.frame())
  })

  all_artifacts <- tryCatch({
      all_artifacts <- rbind.fill(pubs_metadata, datasets_metadata)
    }, error = function(err){
      print(err)
      if (nrow(pubs_metadata) > 0) {
        all_artifacts <- pubs_metadata
      } else if (nrow(datasets_metadata) > 0){
        all_artifacts <- datasets_metadata
      } else {
        all_artifacts <- data.frame()
      }
      return (data.frame())
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
  
  all_artifacts$oa_state = ifelse(all_artifacts$accessright == "Open Access", 1, 0)
  all_artifacts$url = all_artifacts$id

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
  resulttype = ".//resulttype/@classid",
  language = ".//language",
  journal = ".//journal",
  link = ".//children/instance/webresource/url",
  fulltext = ".//fulltext",
  paper_abstract = ".//description",
  doi = ".//pid[@classid=\"doi\"]",
  id = ".//result[@objidentifier]",
  project_id = ".//code",
  accessright = ".//bestaccessright/@classname"
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
    df$doi <- unlist(lapply(df$doi, tolower))
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
  } else if (length(titles) == 1) {
    response <- cr_works(flq=c('query.title'=titles))$data
    dois <- check_distance(titles, response[1,])
  } else {
    dois <- ""
  }
  df$doi[c(missing_doi_indices)] <- dois
  return (df)
}

check_distance <- function(title, candidate) {
  lv_ratio <- levenshtein_ratio(tolower(title), tolower(candidate$title))
  if (lv_ratio <= 1/15.83){
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
