library(xml2)
library(plyr)
library(ropenaire)
library(rcrossref)
library(stringr)

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


olog <- getLogger('api.openaire')

get_papers <- function(query, params, limit=NULL) {

  olog$info(query)
  start.time <- Sys.time()
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
    olog$warn(paste0("publications: ", err))
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
    olog$warn(paste0("datasets: ", err))
    datasets_metadata <-
    return (data.frame())
  })

  all_artifacts <- tryCatch({
      all_artifacts <- rbind.fill(pubs_metadata, datasets_metadata)
    }, error = function(err){
      olog$warn(err)
      if (nrow(pubs_metadata) > 0) {
        all_artifacts <- pubs_metadata
      } else if (nrow(datasets_metadata) > 0){
        all_artifacts <- datasets_metadata
      } else {
        all_artifacts <- data.frame()
      }
      return (data.frame())
    })

  end.time <- Sys.time()
  time.taken <- end.time - start.time
  olog$info(paste("Time taken:", time.taken, sep=" "))

  tryCatch({
    get_return_values(all_artifacts)
    }, error = function(err){
      olog$warn(err)
      olog$warn((paste("Empty returns, most likely no results found for project_id", project_id)))
      stop(paste("Empty returns, most likely no results found for project_id", project_id))
    })
}

get_return_values <- function(all_artifacts){
  # crude filling
  all_artifacts[is.na(all_artifacts)] <- ""
  all_artifacts <- preprocess_data(all_artifacts)
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

preprocess_data <- function(all_artifacts){
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("\\[[A-Za-z \\.-]+\\]", "", x)})) # removes [ INFO.INFO-MA ] Computer Science [cs]/Multiagent Systems [cs.MA]
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub(" ?/", ";", x)}))
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("\\:.*\\:\\:", "", x)})) # keeps only last part after :: ":Enginyeria de la telecomunicació::Processament del senyal::Reconeixement de formes [Àrees temàtiques de la UPC]"
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("Q[A-Z]?\\d{1,2}.*\\. ?", "", x)})) # keeps only last part, here Computer science "QA75 Electronic computers. Computer science; számítástechnika, számítógéptudomány"
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("QA\\d{1,2}", "", x)}))
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("\\d+\\.\\d+", "", x)})) # 007.52
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("info:eu-repo;classification;ddc;\\d+", "", x)})) # ddc classification
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("info:eu-repo;classification;acm;\\w+.\\d+.\\d+ ", "", x)})) # acm classification
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("ddc:\\d+", "", x)}))
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("jel:[A-Z]+\\d+", "", x)}))
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("[A-Z]{2}\\d+-\\d+", "", x)})) # e.g. "TA1-2040"
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("\\w*\\:\\:", "", x)})) # keeps only last part of e.g. Physics::Optics
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub("\\w+_[A-Z]+-?[A-Z]+", "", x)})) # removes ComputerSystemsOrganization_COMPUTER-COMMUNICATIONNETWORKS
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {gsub(".*- ", "", x)})) # keeps only last part of e.g. High energy physics - lattice
  all_artifacts$subject <- unlist(lapply(all_artifacts$subject, function(x) {if (grepl("pubmedpublicationtype", x)) {
                                                                              return ("")}
                                                                             else {
                                                                               return (x)}
                                                                              })) # removes ;dk;atira;pure;researchoutput;pubmedpublicationtype;D013486
  all_artifacts$paper_abstract <- unlist(lapply(all_artifacts$paper_abstract, function(x){gsub("\\n", " ", x)}))
  all_artifacts$doi <- unlist(lapply(all_artifacts$doi, function(x) {str_replace_all(x, "[\r\n\t]" , "")}))
  return (all_artifacts)
}

fields <- c(
  subject = ".//subject",
  title = ".//title",
  year = ".//dateofacceptance",
  publisher = ".//publisher",
  resulttype = ".//resulttype/@classid",
  language = ".//language",
  published_in = ".//journal",
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
    df$authors <- unlist(lapply(results, function(result){
        paste(unlist(lapply(xml_find_all(result, ".//creator"), xml_text)), collapse="; ")
    }))
    return (df)
  } else {
    olog$warn("Length of results: ", length(tmp))
    stop("Length of results: ", length(tmp))
  }
}

fill_dois <- function(df) {
  missing_doi_indices <- which(is.na(df$doi))
  titles <- df[missing_doi_indices,]$title
  if (exists("DEBUG") && DEBUG) {
    olog$debug(paste("Missing DOIs:", length(titles)))
    olog$debug("Time for filling missing DOIs")
    olog$debug(system.time(cr_works(query=queries(titles), async=TRUE)))
  }
  if (length(titles) > 1) {
    response <- cr_works(query=queries(titles), async=TRUE)
    candidates <- lapply(response, get_doi_candidates)
    dois <- mapply(check_distance, titles, candidates, USE.NAMES=FALSE)
  } else if (length(titles) == 1) {
    response <- cr_works(flq=c('query.title'=titles))$data
    candidate_response = response[1,]
    dois <- check_distance(titles, candidate_response)
  } else {
    dois <- ""
  }
  df$doi[c(missing_doi_indices)] <- dois
  return (df)
}

get_doi_candidates <- function(response){
  if (nrow(response) >= 1) {
    candidate = response[1,c('doi', 'title')]
  } else {
    candidate = list(doi="", title="")
  }
  return (candidate)
}

check_distance <- function(title, candidate) {
  lv_ratio <- levenshtein_ratio(tolower(title), tolower(candidate$title))
  if (!is.na(lv_ratio) && lv_ratio <= 1/15.83){
    doi <- candidate$doi
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
