library(rplos)

get_papers <- function(query, params, limit=100, fields="title,id,counter_total_month,abstract,journal,publication_date,author,subject,article_type") {
  
  date_string = paste("publication_date:[", params$from, "T00:00:00Z", " TO ", params$to, "T23:59:59Z]", sep="")
  article_types_string = paste("article_type:(", '"', paste(params$article_types, sep='"', collapse='" OR "'), '")', sep="")
  journals_string = paste("cross_published_journal_key:(", '"', paste(params$journals, sep='"', collapse='" OR "'), '")', sep="")
  
  
  # Get data from PLOS API
  #start.time <- Sys.time()
  
  #Format for fq: article_type:("Review" OR "Editorial")'
  
  search_data <- searchplos(q=query, fq=list(article_types_string, journals_string, date_string, "doc_type:full"),
                            fl=fields,
                            limit=limit)
  
  #end.time <- Sys.time()
  #time.taken <- end.time - start.time
  #time.taken
  
  metadata = search_data$data
  
  names(metadata)[names(metadata)=="counter_total_month"] <- "readers"
  names(metadata)[names(metadata)=="abstract"] <- "paper_abstract"
  names(metadata)[names(metadata)=="journal"] <- "published_in"
  names(metadata)[names(metadata)=="publication_date"] <- "year"
  names(metadata)[names(metadata)=="author"] <- "authors"
  metadata["url"] = paste("http://dx.doi.org/", metadata$id, sep="")
  metadata["content"] = paste(metadata$title, metadata$abstract, metadata$journal, metadata$author, metadata$subject, sep=" ")
  dates = as.Date(metadata$year)
  metadata$year = format(dates, format="%B %d %Y")
  
  
  text = metadata[,c("id", "content")]
  metadata$content <- NULL
  
  ret_val=list("metadata" = metadata, "text"=text)
  return(ret_val)
}