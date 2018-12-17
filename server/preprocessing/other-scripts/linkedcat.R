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

  hl_flag <- TRUE

  lclog$info(paste("Search: ", query, sep=""))
  start.time <- Sys.time()

  conn <- SolrClient$new(host=Sys.getenv("LINKEDCAT_SOLR"),
                         path="solr/linkedcat", port=NULL, scheme="https")

  q_params <- build_query(query, params, limit)
  # do search
  lclog$info(paste("Query:", paste(q_params, collapse = " ")))

  if (hl_flag) {
    res <- solr_all(conn, "linkedcat", params = q_params)
  } else {
    q_params$hl <- 'off'
    res <- solr_all(conn, "linkedcat", params = q_params)
  }

  if (nrow(res$search) == 0){
    stop(paste("No results retrieved."))
  }

  # make results dataframe
  metadata <- data.frame(res$search)
  if (hl_flag) {
    highlights <- data.frame(res$high)
    highlights <- ddply(highlights, .(names), summarize, snippets=paste(ocrtext, collapse=" ... "))
    metadata <- merge(x = metadata, y = highlights, by.x='id', by.y='names')
  } else {
    metadata$snippets <- ""
  }

  metadata[is.na(metadata)] <- ""
  metadata$subject <- if (!is.null(metadata$keyword_a)) metadata$keyword_a else ""
  metadata$authors <- metadata$author100_a
  metadata$author_date <- metadata$author100_d
  metadata$title <- if (!is.null(metadata$main_title)) metadata$main_title else ""
  metadata$paper_abstract <- if (!is.null(metadata$ocrtext)) metadata$ocrtext else ""
  metadata$year <- metadata$pub_year
  metadata$readers <- 0
  metadata$url <- metadata$id
  metadata$link <- "" # needs fix
  metadata$published_in <- metadata$host_label
  metadata$oa_state <- 1
  metadata$subject_orig = metadata$subject
  metadata$relevance = c(nrow(metadata):1)

  text = data.frame(matrix(nrow=nrow(metadata)))
  text$id = metadata$id
  # Add all keywords, including classification to text
  text$content = paste(metadata$main_title, metadata$keyword_a,
                       sep = " ")


  ret_val=list("metadata" = metadata, "text" = text)

  end.time <- Sys.time()
  time.taken <- end.time - start.time
  lclog$info(paste("Time taken:", time.taken, sep = " "))

  return(ret_val)

}

build_query <- function(query, params, limit){
  # fields to query in
  q_fields <- c('main_title', 'ocrtext', 'author')
  # fields to return
  r_fields <- c('id', 'idnr',
                'content_type_a', 'content_type_2',
                'main_title', 'subtitle', 'pub_year',
                'host_label', 'host_maintitle', 'host_pubplace', 'host_pubyear',
                'author100_a', 'author100_d', 'author100_0', 'author100_4',
                'ddc_a', 'ddc_2', 'bkl_a',
                'keyword_a', 'tags', 'category', 'bib', 'language_code',
                'ocrtext_good', 'ocrtext')
  q <- paste(paste(q_fields, query, sep = ":"), collapse = " ")
  q_params <- list(q = q, rows = limit, fl = r_fields)

  # additional filter params
  pub_year <- paste0("pub_year:", "[", params$from, " TO ", params$to, "]")
  if (!params$include_content_type[1] == 'all') {
      if (length(params$include_content_type) > 1) {
        content_type <- paste0("content_type_a_str:(",
                       paste0(params$include_content_type, collapse = " OR "),
                       ")")
        } else {
        content_type <- paste0("content_type_a_str:", params$include_content_type, collapse = "")
      }
    q_params$fq <- list(pub_year, content_type)
  } else {
    q_params$fq <- list(pub_year)
  }
  q_params$fq <- unlist(q_params$fq)
  q_params$hl <- 'on'
  # q_params$hl.fl <- paste(q_fields, collapse=",")
  q_params$hl.fl <- 'ocrtext'
  q_params$hl.snippets <- 100
  # end adding filter params
  return(q_params)
}


valid_langs <- list(
    'ger'='german'
)
