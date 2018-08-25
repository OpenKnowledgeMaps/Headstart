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


get_stopwords <- function(lang, add_stop_words, testing) {
  stops <- stopwords(lang)

  if (!is.null(add_stop_words)){
    if (isTRUE(testing)) {
      add_stop_path <- paste0("../../resources/", add_stop_words, ".stop")
    } else {
      add_stop_path <- paste0("../resources/", add_stop_words, ".stop")
    }
    additional_stops <- scan(add_stop_path, what="", sep="\n")
    stops = c(stops, additional_stops)
  }
  return(stops)
}
