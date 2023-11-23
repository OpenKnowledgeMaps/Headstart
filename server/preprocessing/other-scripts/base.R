library(rbace)
library(stringr)
library(dplyr)
source('preprocess.R')

# get_papers
#
# Params:
#
# * query: search query
# * params: parameters for the search in JSON format
#    * from: publication date lower bound in the form YYYY-MM-DD
#    * to: publication date upper bound in the form YYYY-MM-DD
#    * article_types: in the form of an array of identifiers of article types
#    * sorting: can be one of "most-relevant" and "most-recent"
# * limit: number of search results to return
# * retry_opts: BASE retry options, see `?rbace::bs_retry_options` for documentation.
#  `?httr::RETRY` has more detailed explanation of the options. default values are used if
#   none are supplied.
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
# * "oa_state": open access status of the item; has the following possible states: 0 for no, 1 for yes, 2 for unknown
# * "link": link to the PDF; if this is not available, a list of candidate URLs that may contain a link to the PDF


blog <- getLogger('api.base')

get_papers <- function(query, params,
                       retry_opts=rbace::bs_retry_options(3,60,3,4)) {

  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Search:", query))
  start.time <- Sys.time()

  if (!is.null(query)) {
    exact_query <- preprocess_query((query))
  } else {
    exact_query <- NULL
  }

  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "exact query:", exact_query))

  year_from = params$from
  year_to = params$to
  limit = params$limit

  # prepare query fields
  document_types = paste("dctypenorm:", "(", paste(params$document_types, collapse=" OR "), ")", sep="")
  
  sortby_string = ifelse(params$sorting == "most-recent", "dcyear desc", "")
  return_fields <- "dcdocid,dctitle,dcdescription,dcsource,dcdate,dcsubject,dccreator,dclink,dcoa,dcidentifier,dcrelation,dctype,dctypenorm,dcprovider,dclang,dclanguage,dccoverage"

  if (!is.null(exact_query) && exact_query != '') {
    base_query <- paste(paste0("(",exact_query,")"), document_types, collapse=" ")
  } else {
    base_query <- paste(document_types, collapse=" ")
  }

  date_string = paste0("dcdate:[", params$from, " TO ", params$to , "]")
  if (!is.null(params$exclude_date_filters) && (params$exclude_date_filters == TRUE ||
                                                params$exclude_date_filters == "true")) {
  } else {
    base_query <- paste(date_string, base_query)
  }

  # apply language filter if parameter is set
  lang_id <- params$lang_id
  if (!is.null(lang_id) && lang_id != "all-lang") {
    lang_query = paste("dclang:", "(", paste(params$lang_id, collapse=" OR "), ")", sep="")
    base_query <- paste(base_query, lang_query)
  }
    
  q_advanced = params$q_advanced
  if (!is.null(q_advanced)) {
    base_query <- paste(base_query, q_advanced)
  }

  min_descsize <- if (is.null(params$min_descsize)) 300 else params$min_descsize
  filter <- I(paste0('descsize:[', min_descsize, '%20TO%20*]'))
  limit <- params$limit

  repo = params$repo
  coll = params$coll
  if(!is.null(repo) && repo=="fttriple") {
    non_public = TRUE
  } else {
    non_public = FALSE
  }

  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "BASE query:", base_query))
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Sort by:", sortby_string))
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Min descsize:", min_descsize))
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Target:", repo))
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Collection:", coll))

  # execute search
  offset = 0
  res_raw <- get_raw_data(limit,
                          base_query,
                          return_fields,
                          sortby_string,
                          filter,
                          repo,
                          coll,
                          retry_opts,
                          offset,
                          non_public)
  res <- res_raw$docs
  if (nrow(res)==0){
    stop(paste("No results retrieved."))
  }
  metadata <- etl(res, repo, non_public)
  metadata <- sanitize_abstract(metadata)
  metadata <- mark_duplicates(metadata)
  metadata$has_dataset <- unlist(lapply(metadata$resulttype, function(x) "Dataset" %in% x))
  req_limit <- 9
  
  r <- 0
  while (nrow(metadata) - sum(metadata$is_duplicate) < limit && attr(res_raw, "numFound") > offset+120 && r < req_limit) {
    offset <- offset+120
    res_raw <- get_raw_data(limit,
                            base_query,
                            return_fields,
                            sortby_string,
                            filter,
                            repo,
                            coll,
                            retry_opts,
                            offset,
                            non_public)
    res <- bind_rows(res, res_raw$docs)
    metadata <- etl(res, repo, non_public)
    metadata <- unique(metadata, by = "id")
    metadata <- sanitize_abstract(metadata)
    metadata <- mark_duplicates(metadata)
    metadata$has_dataset <- unlist(lapply(metadata$resulttype, function(x) "Dataset" %in% x))
    r <- r+1
  }
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Deduplication retrieval requests:", r))

  metadata <- unique(metadata, by = "id")
  text = data.frame(matrix(nrow=length(metadata$id)))
  text$id = metadata$id
  # Add all keywords, including classification to text
  text$content = paste(metadata$title, metadata$paper_abstract,
                       metadata$subject_orig, metadata$published_in, metadata$authors,
                       sep=" ")


  input_data=list("metadata" = metadata, "text"=text)

  end.time <- Sys.time()
  time.taken <- end.time - start.time
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Time taken:", time.taken, sep=" "))

  return(input_data)
}

etl <- function(res, repo, non_public) {
  metadata = data.frame(matrix(nrow=length(res$dcdocid)))

  metadata$id = res$dcdocid
  metadata$relation = check_metadata(res$dcrelation)
  metadata$identifier = check_metadata(res$dcidentifier)
  metadata$title = check_metadata(res$dctitle)
  metadata$title = str_replace(metadata$title, " ...$", "")
  metadata$paper_abstract = check_metadata(res$dcdescription)
  metadata$published_in = check_metadata(res$dcsource)
  metadata$year = check_metadata(res$dcdate)

  subject_all = check_metadata(res$dcsubject)

  metadata$subject_orig = subject_all

  subject_cleaned = gsub("DOAJ:[^;]*(;|$)?", "", subject_all) # remove DOAJ classification
  subject_cleaned = gsub("/dk/atira[^;]*(;|$)?", "", subject_cleaned) # remove atira classification
  subject_cleaned = gsub("ddc:[0-9]+(;|$)?", "", subject_cleaned) # remove Dewey Decimal Classification
  subject_cleaned = gsub("([\\w\\/\\:-])*?\\/ddc\\/([\\/0-9\\.])*", "", subject_cleaned) # remove Dewey Decimal Classification in URI form
  subject_cleaned = gsub("[A-Z,0-9]{2,}-[A-Z,0-9\\.]{2,}(;|$)?", "", subject_cleaned) #remove LOC classification
  subject_cleaned = gsub("[^\\(;]+\\(General\\)(;|$)?", "", subject_cleaned) # remove general subjects
  subject_cleaned = gsub("[^\\(;]+\\(all\\)(;|$)?", "", subject_cleaned) # remove general subjects
  subject_cleaned = gsub("[^:;]+ ?:: ?[^;]+(;|$)?", "", subject_cleaned) #remove classification with separator ::
  subject_cleaned = gsub("[^\\[;]+\\[[A-Z,0-9]+\\](;|$)?", "", subject_cleaned) # remove WHO classification
  subject_cleaned = gsub("([A-Za-z]+:[A-Za-z0-9][A-Za-z0-9 \\/\\.]+);?", "", subject_cleaned, perl=TRUE) # clean up annotations with prefix e.g. theme:annotation
  subject_cleaned = gsub("(wikidata)?\\.org/entity/[qQ]([\\d]+)?", "", subject_cleaned) # remove wikidata classification
  subject_cleaned = gsub("</keyword><keyword>", "", subject_cleaned) # remove </keyword><keyword>
  subject_cleaned = gsub("\\[No keyword\\]", "", subject_cleaned)
  subject_cleaned = gsub("\\[[^\\[]+\\][^\\;]+(;|$)?", "", subject_cleaned) # remove classification
  subject_cleaned = gsub("[0-9]{2,} [A-Z]+[^;]*(;|$)?", "", subject_cleaned) #remove classification
  subject_cleaned = gsub(" -- ", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub(" \\(  ", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub("(\\w* \\w*(\\.)( \\w* \\w*)?)", "; ", subject_cleaned) # remove overly broad keywords separated by .
  subject_cleaned = gsub("\\. ", "; ", subject_cleaned) # replace inconsistent keyword separation
  subject_cleaned = gsub(" ?\\d[:?-?]?(\\d+.)+", "", subject_cleaned) # replace residuals like 5:621.313.323 or '5-76.95'
  subject_cleaned = gsub("\\w+:\\w+-(\\w+\\/)+", "", subject_cleaned) # replace residuals like Info:eu-repo/classification/
  subject_cleaned = gsub("^; $", "", subject_cleaned) # clean up keyword separation
  subject_cleaned = gsub(",", ", ", subject_cleaned) # clean up keyword separation
  subject_cleaned = gsub("\\s+", " ", subject_cleaned) # clean up keyword separation
  subject_cleaned = stringi::stri_trim(subject_cleaned) # clean up keyword separation
  metadata$subject = subject_cleaned

  metadata$authors = check_metadata(res$dccreator)

  metadata$link = check_metadata(res$dclink)
  metadata$oa_state = res$dcoa
  metadata$url = metadata$id
  metadata$relevance = c(nrow(metadata):1)
  metadata$resulttype = lapply(res$dctypenorm, decode_dctypenorm)
  metadata$dctype = check_metadata(res$dctype)
  metadata$dctypenorm = check_metadata(res$dctypenorm)
  metadata$doi = unlist(lapply(metadata$link, find_dois))
  metadata$dclang = check_metadata(res$dclang)
  metadata$dclanguage = check_metadata(res$dclanguage)
  metadata$content_provider = check_metadata(res$dcprovider)
  metadata$dccoverage = check_metadata(res$dccoverage)
  if(repo=="fttriple" && non_public==TRUE) {
    metadata$content_provider <- "GoTriple"
  }

  return (metadata)
}


preprocess_query <- function(query) {
    # remove pluses between terms
  query_wt_plus = gsub("(?!\\B\"[^\"]*)[\\+]+(?![^\"]*\"\\B)", " ", query, perl=T)
  # remove multiple minuses and spaces after minuses
  query_wt_multi_minus = gsub("(?!\\B\"[^\"]*)((^|\\s))[\\-]+[\\s]*(?![^\"]*\"\\B)", "\\1-", query_wt_plus, perl=T)
  # remove multiple spaces inside the query
  query_wt_multi_spaces = gsub("(?!\\B\"[^\"]*)[\\s]{2,}(?![^\"]*\"\\B)", " ", query_wt_multi_minus, perl=T)
  # trim query, if needed
  query_cleaned = gsub("^\\s+|\\s+$", "", query_wt_multi_spaces, perl=T)

  # add "textus:" to each word/phrase to enable verbatim search
  # make sure it is added after any opening parentheses to enable queries such as "(a and b) or (a and c)"
  exact_query = gsub('([\"]+(.*?)[\"]+)|(?<=\\(\\b|\\+|-\\"\\b|\\s-\\b|^-\\b)|(?!or\\b|and\\b|[-]+[\\"\\(]*\\b)(?<!\\S)(?=\\S)(?!\\(|\\+)'
                     , "textus:\\1", query_cleaned, perl=T)
  return(exact_query)
}


get_raw_data <- function(limit, base_query, return_fields, sortby_string, filter, repo, coll, retry_opts, offset, non_public) {
  t <- 0
  while (t < retry_opts$times) {
    res_raw <- try(
      (bs_search(hits=limit
                  , fields = return_fields,
                  , query = base_query
                  , sortby = sortby_string
                  , filter = filter
                  , target = repo
                  , coll = coll
                  , retry = retry_opts
                  , offset = offset
                  , non_public = non_public)))
    if (inherits(res_raw, "try-error")) {
      if (grepl("Timeout was reached: [api.base-search.net]", res_raw, fixed=TRUE)) {
        t <- t + 1
        Sys.sleep(2)
        blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "BASE API Timeout retry attempt:", t, sep=" "))
      } else {
        stop("Timeout was reached: [api.base-search.net]")
      }
    } else {
      break
    }
  }
  return(res_raw)
}


find_dois <- function(link) {
  if ((startsWith(link, "http://doi.org"))
      || (startsWith(link, "https://doi.org"))
      || (startsWith(link, "http://dx.doi.org"))
      || (startsWith(link, "https://dx.doi.org"))) {
    doi <- str_replace(link, "http:", "https:")
  } else {
    doi <- ""
  }
  return(doi)
}


decode_dctypenorm <- function(dctypestring) {
  typecodes <- strsplit(dctypestring, "; ")
  typecodes <- lapply(typecodes, function(x) {dctypenorm_decoder[x]})
  typecodes <- unlist(unname(typecodes[[1]]))
  return(typecodes)
}

dctypenorm_decoder <- list(
  "4"="Audio",
  "11"="Book",
  "111"="Book part",
  "13"="Conference object",
  "16"="Course material",
  "7"="Dataset",
  "5"="Image/video",
  "12"="Journal/newspaper",
  "121"="Journal/newspaper article",
  "122"="Journal/newspaper other content",
  "17"="Lecture",
  "19"="Manuscript",
  "3"="Map",
  "52"="Moving image/video",
  "2"="Musical notation",
  "F"="Other/Unknown material",
  "1A"="Patent",
  "14"="Report",
  "15"="Review",
  "6"="Software",
  "51"="Still image",
  "1"="Text",
  "18"="Thesis",
  "181"="Thesis: bachelor",
  "183"="Thesis: doctoral and postdoctoral",
  "182"="Thesis: master"
)
