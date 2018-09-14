library(stringdist)

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

setup_logging <- function(loglevel) {
  # checks if HEADSTART_LOGFILE is defined,
  # if not logs to console only
  if (Sys.getenv("HEADSTART_LOGFILE") == ""){
    getLogger(loglevel)
    removeHandler('basic.stdout')
    addHandler(writeToConsole)
  } else {
    getLogger(loglevel)
    removeHandler('basic.stdout')
    addHandler(writeToFile, file=Sys.getenv("HEADSTART_LOGFILE"))
  }
}
