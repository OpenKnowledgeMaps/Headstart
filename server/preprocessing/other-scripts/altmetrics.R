library('rAltmetric')
library('rcrossref')

enrich_output_json <- function(output_json){
  output<- fromJSON(output_json)
  
  results <- get_altmetrics(output$doi)
  
  if (nrow(results) > 0){
    if (!("cited_by_tweeters_count" %in% names(results))) {
      results[["cited_by_tweeters_count"]]  = NA
    }
    if (!("readers.mendeley" %in% names(results))) {
      results[["readers.mendeley"]]  = NA
    }
    results <- results[c('doi', 'cited_by_tweeters_count', 'readers.mendeley')]
    output <- merge(x = output, y = results, by='doi', all.x=TRUE)
  } else {
    output$'cited_by_tweeters_count' <- NA
    output$'readers.mendeley' <- NA
    print("No altmetrics found for any paper in this dataset.")
  }
  output <- add_citations(output)
  
  #Remove duplicate lines - TODO: check for root of this problem
  output = unique(output)

  output$cited_by_tweeters_count[is.na(output$cited_by_tweeters_count)] <- "N/A"  
  output$citation_count[is.na(output$citation_count)] <- "N/A"
  output$'readers.mendeley'[is.na(output$'readers.mendeley')] <- "N/A"
  
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
  
  # doc_parse_raw exception hotfix
  #cit_count = cr_citation_count(doi=dois[valid_dois], async=TRUE)
  cit_count = data.frame()
  for (doi in dois[valid_dois]){
    cc <- tryCatch({
      cr_citation_count(doi=doi, async=TRUE)
      }, error = function(err){
          print(paste(err, doi))
          return(list(doi=doi, count=NA))
      })
    cit_count <- rbind(cit_count, cc)
  }
  output = merge(x=output, y=cit_count, by='doi', all.x = TRUE)
  names(output)[names(output)=="count"] <- "citation_count"
  return (output)
}
