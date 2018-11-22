library(solrium)

# get_papers
#
# Params:
#
# * query: search query
# * params: parameters for the search in JSON format
#    * from: publication date lower bound in the form YYYY-MM-DD
#    * to: publication date upper bound in the form YYYY-MM-DD
#    * article_types: in the form of an array of identifiers of article types
#    * sorting: can be one of "most-relevant" and "most-recent"
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
# * "oa_state": open access status of the item; has the following possible states: 0 for no, 1 for yes, 2 for unknown
# * "link": link to the PDF; if this is not available, a list of candidate URLs that may contain a link to the PDF


lclog <- getLogger('api.linkedcat')


get_papers <- function(query, params, limit=100) {


  lclog$info(paste("Search: ", query, sep=""))
  start.time <- Sys.time()

  conn <- SolrClient$new(host=Sys.getenv("LINKEDCAT_SOLR"),
                         path="solr/linkedcat", port=NULL, scheme="https")

  q_params = build_query(query, params, limit)
  # do search
  lclog$info(paste("Query:", paste(q_params, collapse = " ")))
  res <- solr_search(conn, "linkedcat", params = q_params)

  if (nrow(res)==0){
    stop(paste("No results retrieved."))
  }

  # make results dataframe
  metadata <- data.frame(res)
  metadata[is.na(metadata)] <- ""
  metadata$subject <- metadata$keywords
  metadata$subject_orig <- metadata$subject
  metadata$paper_abstract <- if ("ocrtext_good" %in% names(metadata)) metadata$ocrtext_good else ""
  metadata$authors <- metadata$author100_a
  metadata$title <- metadata$host_label
  metadata$year <- metadata$pubyear
  metadata$readers <- 0
  metadata$url <- "" # needs fix
  metadata$link <- "" # needs fix
  metadata$published_in <- "" # needs fix
  metadata$oa_state <- 1

  text = data.frame(matrix(nrow=nrow(metadata)))
  text$id = metadata$id
  # Add all keywords, including classification to text
  text$content = paste(metadata$title_str, metadata$subtitle_str,
                       metadata$keywords_str, metadata$maintitle_str,
                       metadata$paper_abstract,
                       sep = " ")


  ret_val=list("metadata" = metadata, "text" = text)

  end.time <- Sys.time()
  time.taken <- end.time - start.time
  lclog$info(paste("Time taken:", time.taken, sep = " "))

  return(ret_val)

}

build_query <- function(query, params, limit){
  fields = c('maintitle', 'keywords', 'ocrtext', 'author', 'host', 'ddc')
  q = paste(paste(fields, query, sep = ":"), collapse = " ")
  pubyear = paste0("pubyear:", "[", params$from, " TO ", params$to, "]")
  return(list(q = q, rows = limit, fq = pubyear))
}


valid_langs <- list(
    'ger'='german'
)
