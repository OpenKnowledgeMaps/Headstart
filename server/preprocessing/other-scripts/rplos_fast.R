library(rplos)

# get_papers
#
# Params:
#
# * query: search query
# * params: parameters for the search in JSON format
# * limit: number of search results to return
# * fields: list of fields to return
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

get_papers <- function(query, params, limit=100,
                       fields="title,id,counter_total_month,abstract,journal,publication_date,author,subject,article_type",
                       language='english') {

  date_string = paste("publication_date:[", params$from, "T00:00:00Z", " TO ", params$to, "T23:59:59Z]", sep="")
  article_types_string = paste("article_type:(", '"', paste(params$article_types, sep='"', collapse='" OR "'), '")', sep="")
  journals_string = paste("journal_key:(", '"', paste(params$journals, sep='"', collapse='" OR "'), '")', sep="")
  sortby_string = ifelse(params$sorting == "most-recent", "publication_date desc", "")

  # Get data from PLOS API

  search_data <- searchplos(q=paste("everything_rev:", query, sep=""),
                            fq=list(article_types_string, journals_string, date_string, "doc_type:full"),
                            fl=fields,
                            sort=sortby_string,
                            limit=limit)

  metadata = search_data$data
  text = data.frame("id" = metadata$id)
  text$content = paste(metadata$title, metadata$abstract, metadata$journal, metadata$author, metadata$subject, sep=" ")

  names(metadata)[names(metadata)=="counter_total_month"] <- "readers"
  names(metadata)[names(metadata)=="abstract"] <- "paper_abstract"
  names(metadata)[names(metadata)=="journal"] <- "published_in"
  names(metadata)[names(metadata)=="publication_date"] <- "year"
  names(metadata)[names(metadata)=="author"] <- "authors"
  metadata["url"] = paste("http://dx.doi.org/", metadata$id, sep="")
  dates = as.Date(metadata$year)
  metadata$year = format(dates, format="%B %d %Y")
  metadata$subject_orig = metadata$subject

  ret_val=list("metadata" = metadata, "text"=text)
  return(ret_val)
}
