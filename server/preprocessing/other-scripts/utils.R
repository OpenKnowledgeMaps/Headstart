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


# Configure logging at the given level. Sets the *root logger level* so that
# records at `loglevel` and above are actually emitted -- the previous version
# called getLogger(loglevel), which only created a logger named after the level
# and left the root at INFO, so every $debug() message was silently dropped.
# Records are written to LOGFILE when it is set, otherwise to the console.
setup_logging <- function(loglevel) {
  setLevel(loglevel)
  removeHandler('basic.stdout')
  if (Sys.getenv("LOGFILE") == ""){
    addHandler(writeToConsole, level = loglevel)
  } else {
    if (!file.exists(Sys.getenv("LOGFILE"))) {
      file.create(Sys.getenv("LOGFILE"))
    }
    addHandler(writeToFile, file = Sys.getenv("LOGFILE"), level = loglevel)
  }
}


# TRUE when debug logging and data dumping are enabled (LOGLEVEL=DEBUG). Single
# source of truth for the debug flag, reused for both verbose logs and dumps.
debug_enabled <- function() {
  Sys.getenv("LOGLEVEL") == "DEBUG"
}


# Dump an intermediate object to a per-vis debug folder, for manual inspection
# and as test fixtures -- mirrors the _log_dataframe pattern of the BASE/ORCID
# workers. Only writes when debug_enabled(). Data frames are written as CSV, other
# R objects (lists, corpora, ...) as RDS, under <DUMP_DIR>/<vis_id>/<stage>.<ext>
# (DUMP_DIR defaults to /headstart/output). Failures are logged, never fatal.
dump_data <- function(obj, stage) {
  if (!debug_enabled()) return(invisible(NULL))
  vis_id <- .GlobalEnv$VIS_ID
  if (is.null(vis_id) || identical(vis_id, "")) vis_id <- "unknown"
  out_dir <- file.path(Sys.getenv("DUMP_DIR", unset = "/headstart/output"), vis_id)
  tryCatch({
    dir.create(out_dir, recursive = TRUE, showWarnings = FALSE)
    if (is.data.frame(obj)) {
      write.csv(obj, file.path(out_dir, paste0(stage, ".csv")), row.names = FALSE)
    } else {
      saveRDS(obj, file.path(out_dir, paste0(stage, ".rds")))
    }
  }, error = function(e) {
    logwarn(paste("dump_data failed for stage", stage, ":", conditionMessage(e)))
  })
  invisible(NULL)
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

    # If not one of the known data source API errors:
    # "not enough results" or "timeframe too short" if it was specified
    if (length(reason) == 0) {
      has_timeframe <- !is.null(failed$params$to) && !is.null(failed$params$from)
      is_short_timeframe <- has_timeframe && difftime(failed$params$to, failed$params$from) <= 60

      if (is_short_timeframe) {
        reason <- c(reason, 'timeframe too short')
      } else {
        reason <- c(reason, 'not enough results')
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
