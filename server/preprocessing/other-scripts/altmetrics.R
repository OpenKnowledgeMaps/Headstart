library('rAltmetric')
library('rcrossref')

enrich_output_json <- function(output_json){
  output<- fromJSON(output_json)
  results <- get_altmetrics(output$doi)
  if (nrow(results) > 0){
    results <- results[c('doi', 'cited_by_tweeters_count', 'readers.mendeley')]
    output <- merge(output, results, by='doi', all=TRUE)
  } else {
    output$'cited_by_tweeters_count' <- NA
    output$'readers.mendeley' <- NA
    print("No altmetrics found for any paper in this dataset.")
  }
  output <- add_citations(output)
  output_json <- toJSON(output)
  return (output_json)
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
