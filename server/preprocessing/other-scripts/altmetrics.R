library(rAltmetric)
library(magrittr)
library(purrr)

enrich_input <- function(input_data){
  dois <- input_data$metadata$doi
  results <- get_altmetrics(dois)
  input_data$metadata <- merge(input_data$metadata, results, by='doi', all=TRUE)
}

get_altmetrics <- function(dois){
  valid_dois <- which(dois!="")
  ids <- list(c(dois[valid_dois]))
  results <- data.frame()
  for (doi in dois[valid_dois]){
    tryCatch({
      metrics <- altmetric_data(altmetrics(doi=doi))
      results <- rbind.fill(results, metrics)
    }, error = function(err){
      print(paste(err, doi))
    })
  }
  return (results)
}
