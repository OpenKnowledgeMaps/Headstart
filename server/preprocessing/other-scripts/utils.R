library(stringdist)
library(logging)
library(stringi)


sanitize_query <- function(query) {
  if (!is.null(query)) {
    query <- gsub("\\", "", query, fixed=T)
    sanitized_query <- gsub('[“”„”]', '"', query)
  } else {
    sanitized_query <- NULL
  }
  return(list(raw_query=query, sanitized_query=sanitized_query))
}

levenshtein_ratio <- function(a, b) {
  lv_dist = stringdist(a, b, method = "lv")
  lv_ratio = lv_dist/(max(stri_length(a), stri_length(b)))
  return(lv_ratio)
}

check_metadata <- function (field) {
  if(!is.null(field)) {
    return (ifelse(is.na(field), '', field))
  } else {
    return ('')
  }
}


get_stopwords <- function(languages) {
  languages <- c(languages, "spa", "eng", "fre", "ger")
  languages <- unique(languages)
  if (dir.exists("../resources")) {
      stops <- fromJSON("../resources/stopwords_iso_cleaned.json")
      additional_stopwords <- readLines("../resources/additional_stopwords.txt")
    } else if (dir.exists("./resources")) {
      stops <- fromJSON("./resources/stopwords_iso_cleaned.json")
      additional_stopwords <- readLines("./resources/additional_stopwords.txt")
    } else {
      stops <- fromJSON("../../resources/stopwords_iso_cleaned.json")
      additional_stopwords <- readLines("../../resources/additional_stopwords.txt")
    }
  stopwords <- list()
  for (l in languages) {
    if (l %in% names(stops)) {
      stopwords <- c(stopwords, stops[[l]])
    }
  }
  stopwords <- unlist(stopwords)
  stopwords <- c(stopwords, additional_stopwords)
  return(stopwords)
}


setup_logging <- function(loglevel) {
  # checks if LOGFILE is defined,
  # if not logs to console only
  if (Sys.getenv("LOGFILE") == ""){
    getLogger(loglevel)
    removeHandler('basic.stdout')
    addHandler(writeToConsole)
  } else {
    if (!file.exists(Sys.getenv("LOGFILE"))) {
      file.create(Sys.getenv("LOGFILE"))
    }
    getLogger(loglevel)
    removeHandler('basic.stdout')
    addHandler(writeToFile, file=Sys.getenv("LOGFILE"))
  }
}


detect_error <- function(failed, service, params) {
  output <- list()
  reason <- list()
  phrasepattern <- '"(.*?)"'
  # branch off between API errors and our backend errors
  if (!is.null(failed$query_reason)) {
    # map response to individual error codes/messages
    # then return them as json list
    if (length(reason) == 0 && service == 'base') {
      if (grepl("Timeout was reached: [api.base-search.net]", failed$query_reason, fixed=TRUE)){
          reason <- list('BASE error: timeout')
      }
      if (grepl("xml_find_first", failed$query_reason, fixed=TRUE)){
        reason <- c(reason, 'API error: BASE not reachable')
      }
      if (grepl("read_xml.raw", failed$query_reason, fixed=TRUE)){
        reason <- c(reason, 'API error: BASE not reachable')
      }
    }
    if (length(reason) == 0 && service == 'base') {
      if (grepl("Timeout was reached", failed$query_reason, fixed=TRUE)){
          reason <- c(reason, 'API error: timeout')
      }
    }
    if (length(reason) == 0 && service == 'pubmed') {
      if (startsWith(failed$query_reason, "HTTP failure: 500") && grepl("error forwarding request", failed$query_reason, fixed=TRUE)){
          reason <- c(reason, 'API error: requested metadata size')
      }
      if (startsWith(failed$query_reason, "HTTP failure: 500")){
          reason <- c(reason, 'API error: PubMed not reachable')
      }
      if (grepl("Could not resolve host", failed$query_reason, fixed=TRUE)){
          reason <- c(reason, 'API error: PubMed not reachable')
      }
      if (startsWith(failed$query_reason, "HTTP failure")){
          reason <- c(reason, 'unexpected PubMed API error')
      }
    }
    if (length(reason) == 0 && service == 'openaire') {
      if (grepl("Project not found", failed$query_reason, fixed=TRUE)) {
        reason <- c(reason, "project id or funder id wrong")
      }
      if (grepl("No results retrieved", failed$query_reason, fixed=TRUE)) {
        reason <- c(reason, "not enough results for project")
      }
      if (length(reason) == 0) {
        reason <- c(reason, "API error: OpenAIRE not reachable")
      }
    }
    if (length(reason) == 0) {
        result <- regmatches(failed$query, regexec(phrasepattern, failed$query))
        # if not one of the known data source API errors:
        # apply query error detection heuristics
        if (grepl('“', failed$query, fixed = TRUE) ||
            grepl('“', failed$query, fixed = TRUE)) {
          reason <- c(reason, 'query formatting')
        }
        if (!identical(result[[1]], character(0)) &&
            length(unlist(strsplit(result[[1]][2], " "))) > 4) {
          reason <- c(reason, 'too specific')
        } else if (length(unlist(strsplit(failed$query, " "))) < 4) {
          reason <- c(reason, 'typo', 'too specific')
        } else {
          reason <- c(reason, 'query length', 'too specific')
        }
        if (!is.null(failed$params$to) &&
            !is.null(failed$params$from) &&
            difftime(failed$params$to, failed$params$from) <= 60) {
          reason <- c(reason, 'timeframe too short')
      }
    }
  }
  if (length(reason) == 0) {
      reason <- c(reason, 'unexpected data processing error')
  }
  # then return them as json list
  output$reason <- reason
  output$status <- 'error'
  return(toJSON(output, auto_unbox = TRUE))
}
