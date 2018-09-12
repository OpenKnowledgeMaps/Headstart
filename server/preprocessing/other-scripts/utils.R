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

get_stopwords <- function(lang) {
  stops <- tryCatch({
    stops <- stopwords(lang)
  }, error = function(err){
    return(unlist(""))
  })

  stops <- tryCatch({
      # trycatch switch when in test mode
      tryCatch({
          add_stop_path <- paste0("../resources/", lang, ".stop")
          additional_stops <- scan(add_stop_path, what="", sep="\n")
          stops = c(stops, additional_stops)
        },
        error = function(err) {
          add_stop_path <- paste0("../../resources/", lang, ".stop")
          additional_stops <- scan(add_stop_path, what="", sep="\n")
          stops = c(stops, additional_stops)
          return(stops)
        }) # done with trycatch for test mode
      },
      error = function(err) {
        return(stops)
      })
  return(stops)
  }

conditional_lowercase <- function(text, lang) {
  if (lang == 'german') {
    return(text)
  } else {
    return(tolower(text))
  }
}
