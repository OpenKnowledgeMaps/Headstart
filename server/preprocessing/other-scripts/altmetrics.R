library('rAltmetric')
library('rcrossref')

enrich_output <- function(output){
  results <- get_altmetrics(output$doi)
  results <- results[c('doi', 'cited_by_tweeters_count', 'readers.mendeley')]
  output <- merge(output, results, by='doi', all=TRUE)
  output <- add_citations(output)
  return (output)
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

add_citations <- function(output){
  dois <- output$doi
  valid_dois <- which(dois!="")
  cit_count <- check_metadata(unlist(lapply(dois[valid_dois], function(x) cr_citation_count(doi=x))))
  output$citation_count[c(valid_dois)] <- cit_count
  return (output)
}
