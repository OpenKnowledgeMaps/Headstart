library(rbace)

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
  
  date_string = paste0("dcdate:[", params$from, " TO ", params$to , "]")
  
  document_types = paste("dctypenorm:", "(", paste(params$document_types, collapse=" "), ")", sep="")
  
  #Make sure that the abstract exists. NOT WORKING:
  abstract_exists = "dcdescription:?"
  
  (res <- bs_search(hits=100, query = paste(query, date_string, document_types, abstract_exists, collapse=" "),
                    fields="dcdocid,dctitle,dcdescription,dcsource,dcdate,dcsubject,dccreator,dclink,dcoa"))
  
  print(paste(query, date_string, document_types, abstract_exists, sep=" "));
  
  metadata = data.frame(matrix(nrow=length(res$dcdocid)))
  
  metadata$id = res$dcdocid
  
  metadata$title = check_metadata(res$dctitle)
  metadata$paper_abstract = check_metadata(res$dcdescription)
  metadata$published_in = check_metadata(res$dcsource)
  metadata$year = check_metadata(res$dcdate)
  
  metadata$subject = check_metadata(res$dcsubject)
  
  metadata$authors = check_metadata(res$dccreator)
  
  metadata$link = check_metadata(res$dclink)
  metadata$oa_state = res$dcoa
  metadata$url = metadata$id
  metadata$relevance = c(nrow(metadata):1)
  
  text = data.frame(matrix(nrow=length(res$dcdocid)))
  text$id = metadata$id
  text$content = paste(metadata$title, metadata$paper_abstract, metadata$published_in, metadata$authors, metadata$subject, sep=" ")
  
  ret_val=list("metadata" = metadata, "text"=text)
  return(ret_val)
  
}

check_metadata <- function (field) {
  return (ifelse(is.na(field), '', field))
}