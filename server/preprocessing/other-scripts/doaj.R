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
  
  #year_from = substr(params$from, 1, 4)
  #month_from = substr(params$from, 6, 8)
  
  #year_to = substr(params$to, 1, 4)
  #month_to = substr(params$to, 6, 8)
  
  date_string = paste0("year:[", params$from, ":", params$to , "]")
  
  res = jaod_article_search(query="health AND license:CC-BY", pageSize=100)
  
  metadata = res$results
  names(metadata)[names(metadata) == "bibjson.title"] = "title"
  names(metadata)[names(metadata) == "bibjson.abstract"] = "paper_abstract"
  names(metadata)[names(metadata) == "bibjson.journal.title"] = "published_in"
  metadata$year = paste0(metadata$bibjson.year, "-", metadata$bibjson.month)
  names(metadata)[names(metadata) == "bibjson.link"] = "url"
  
  metadata$subject = sapply(metadata$bibjson.keywords, paste0, collapse=";")
  
  authors = c()
  
  for(i in 1:nrow(metadata)) {
    authors[i] = paste0(metadata$bibjson.author[[i]]$name, collapse =";")  
  }
  
  metadata$authors = authors
  
  text = data.frame("id" = metadata$id)
  text$content = paste(metadata$title, metadata$abstract, metadata$journal, metadata$author, metadata$subject, sep=" ")
  
  ret_val=list("metadata" = metadata, "text"=text)
  return(ret_val)
  
}