library(jaod)

# get_papers
#
# Params:
#
# * query: search query
# * params: parameters for the search in JSON format
# * limit: number of search results to return
#
# It is expected that get_papers returns a list containing two data frames named "text" and "metadata"
#
# "text" contains the text for similarity analysis; it is expected to have two columns "id" and "content"
#
# "metadata" contains all metadata; its columns are expected to be named as follows:
# * "id": a unique ID, preferably the DOI
# * "title": the title
# * "authors": authors, preferably in the format "LASTNAME1, FIRSTNAME1;LASTNAME2, FIRSTNAME2"
# * "paper_abstract": the abstract
# * "published_in": name of the journal or venue
# * "year": publication date
# * "url": URL to the landing page
# * "readers": an indicator of the paper's popularity, e.g. number of readers, views, downloads etc.
# * "subject": keywords or classification, split by ;

get_papers <- function(query, params, limit=100, fields="title,id,counter_total_month,abstract,journal,publication_date,author,subject,article_type") {
  
  year_from = params$from
  
  year_to = params$to
  
  date_string = paste0("bibjson.year:[", params$from, " TO ", params$to , "]")
  
  res = jaod_article_search(query=paste0(query, ' AND ', date_string, ' AND language:"English" AND _exists_:bibjson.abstract'), pageSize=100)
  
  metadata = res$results
  names(metadata)[names(metadata) == "bibjson.title"] = "title"
  names(metadata)[names(metadata) == "bibjson.abstract"] = "paper_abstract"
  names(metadata)[names(metadata) == "bibjson.journal.title"] = "published_in"
  metadata$year = ifelse(is.na(metadata$bibjson.month), metadata$bibjson.year, 
                         paste0(metadata$bibjson.year, "-", metadata$bibjson.month))
  
  metadata$subject = sapply(metadata$bibjson.keywords, paste0, collapse=";")
  metadata$subject_orig = metadata$subject
  
  authors = c()
  link = c()
  
  for(i in 1:nrow(metadata)) {
    authors[i] = paste0(metadata$bibjson.author[[i]]$name, collapse =";")
    if(!is.null(metadata$bibjson.link[[i]])) {
      link[i] = metadata$bibjson.link[[i]]$url
    }
  }
  
  metadata$authors = authors
  metadata$link = link
  metadata$url = metadata$id
  metadata$relevance = c(nrow(metadata):1)
  
  text = data.frame("id" = metadata$id)
  text$content = paste(metadata$title, metadata$paper_abstract, metadata$published_in, metadata$authors, metadata$subject, sep=" ")
  
  ret_val=list("metadata" = metadata, "text"=text)
  return(ret_val)
  
}