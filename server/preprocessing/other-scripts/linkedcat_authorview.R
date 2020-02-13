library(solrium)
library(plyr)

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
  host=paste0(Sys.getenv("LINKEDCAT_USER"),":",Sys.getenv("LINKEDCAT_PWD"),"@",Sys.getenv("LINKEDCAT_SOLR"))
  conn <- SolrClient$new(host=host,
                         path="solr/linkedcat2", port=NULL, scheme="https")

  q_params <- build_query(query, params, limit)
  # do search
  lclog$info(paste("Query:", paste(q_params, collapse = " ")))

  res <- solr_all(conn, "linkedcat2", params = q_params, concat="; ")

  if (nrow(res$search) == 0){
    stop(paste("No results retrieved."))
  }

  # make results dataframe
  search_res = res$search
  metadata <- data.frame(search_res$id)
  names(metadata) <- c('id')

  metadata$subject <- search_res$keyword_label
  metadata$authors <- paste(search_res$author100_a, search_res$author700_a, sep="; ")
  metadata$authors <- unlist(lapply(metadata$authors, function(x) {gsub("; $|,$", "", x)}))
  metadata$authors <- unlist(lapply(metadata$authors, function(x) {gsub("^; ", "", x)}))
  metadata$author_date <- metadata$author100_d
  metadata$title <- search_res$main_title
  metadata$paper_abstract <- if (!is.null(search_res$ocrtext)) unlist(lapply(search_res$ocrtext, substr, start=0, stop=1000)) else ""
  metadata$year <- search_res$pub_year
  metadata$readers <- 0
  metadata$url <- search_res$id
  metadata$link <- search_res$goobi_link
  metadata$published_in <- paste(search_res$host_maintitle, search_res$host_pubyear, search_res$host_pubplace, sep=", ")
  metadata$published_in <- unlist(lapply(metadata$published_in, function(x) {gsub(", $|, , ", "", x)}))
  metadata$oa_state <- unlist(lapply(search_res$copyright_until, function(x) {if (x=="") 1 else 0}))
  metadata$subject_orig = metadata$subject
  metadata$relevance = c(nrow(metadata):1)
  metadata$bkl_caption = if (!is.null(search_res$bkl_caption)) search_res$bkl_caption else ""
  metadata$bkl_top_caption = if (!is.null(search_res$bkl_top_caption)) search_res$bkl_top_caption else ""

  text = data.frame(matrix(nrow=nrow(metadata)))
  text$id = metadata$id
  # Add all keywords, including classification to text
  text$content = paste(search_res$main_title, search_res$keyword_label,
                       sep = " ")


  ret_val=list("metadata" = metadata, "text" = text)

  end.time <- Sys.time()
  time.taken <- end.time - start.time
  lclog$info(paste("Time taken:", time.taken, sep = " "))

  return(ret_val)

}

build_query <- function(query, params, limit){
  # fields to query in
  q_fields <- c('author100_a', 'author100_d', 'author100_0',
                'author700_a', 'author700_d', 'author700_0')
  # fields to return
  r_fields <- c('id', 'idnr',
                'content_type_a', 'content_type_2',
                'main_title', 'subtitle', 'pub_year', 'copyright_until',
                'host_maintitle', 'host_pubplace', 'host_pubyear',
                'pub_place', 'pub_name', 'pub_date',
                'author100_a', 'author100_d', 'author100_0', 'author100_4',
                'author700_a', 'author700_d', 'author700_0',
                'bkl_caption', 'bkl_top_caption',
                'keyword_label',
                'tags', 'category', 'bib', 'language_code',
                'ocrtext', 'goobi_link')
  q <- paste(paste0(q_fields, ':', '"', params$author_id, '"'), collapse = " OR ")
  q_params <- list(q = q, rows = limit, fl = r_fields)
  return(q_params)
}


valid_langs <- list(
    'ger'='german'
)
