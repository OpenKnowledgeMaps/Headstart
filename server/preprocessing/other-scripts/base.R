library(rbace)

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


blog <- getLogger('api.base')


get_papers <- function(query, params, limit=100, fields="title,id,counter_total_month,abstract,journal,publication_date,author,subject,article_type") {

  blog$info(paste("Search: ", query, sep=""))
  start.time <- Sys.time()

  exact_query = "";

  if(startsWith(query, '"') && endsWith(query, '"')) {
    exact_query = paste("textus:", query, sep="")
  } else {
    exact_query = gsub("(?<!\\S)(?=\\S)", "textus:", query, perl=T)
  }

  year_from = params$from
  year_to = params$to
  date_string = paste0("dcdate:[", params$from, " TO ", params$to , "]")
  document_types = paste("dctypenorm:", "(", paste(params$document_types, collapse=" OR "), ")", sep="")

  #Make sure that the abstract exists.
  abstract_exists = "dcdescription:?"
  sortby_string = ifelse(params$sorting == "most-recent", "dcyear desc", "")
  (res_raw <- bs_search(hits=limit
                        , query = paste(exact_query, date_string, document_types, abstract_exists, collapse=" ")
                        , fields = "dcdocid,dctitle,dcdescription,dcsource,dcdate,dcsubject,dccreator,dclink,dcoa,dcidentifier,dcrelation"
                        , sortby = sortby_string))
  res <- res_raw$docs

  blog$info(paste("Query:", query, date_string, document_types, abstract_exists, sep=" "));

  metadata = data.frame(matrix(nrow=length(res$dcdocid)))

  metadata$id = res$dcdocid
  metadata$relation = check_metadata(res$dcrelation)
  metadata$identifier = check_metadata(res$dcidentifier)
  metadata$title = check_metadata(res$dctitle)
  metadata$paper_abstract = check_metadata(res$dcdescription)
  metadata$published_in = check_metadata(res$dcsource)
  metadata$year = check_metadata(res$dcdate)

  subject_all = check_metadata(res$dcsubject)

  metadata$subject_orig = subject_all

  #subject = ifelse(subject !="", paste(unique(strsplit(subject, "; ")), "; "),"")

  subject_cleaned = gsub("DOAJ:[^;]*(;|$)?", "", subject_all) # remove DOAJ classification
  subject_cleaned = gsub("/dk/atira[^;]*(;|$)?", "", subject_cleaned) # remove atira classification
  subject_cleaned = gsub("ddc:[0-9]+(;|$)?", "", subject_cleaned) # remove Dewey Decimal Classification
  subject_cleaned = gsub("([\\w\\/\\:-])*?\\/ddc\\/([\\/0-9\\.])*", "", subject_cleaned) # remove Dewey Decimal Classification in URI form
  subject_cleaned = gsub("[A-Z,0-9]{2,}-[A-Z,0-9\\.]{2,}(;|$)?", "", subject_cleaned) #remove LOC classification
  subject_cleaned = gsub("[^\\(;]+\\(General\\)(;|$)?", "", subject_cleaned) # remove general subjects
  subject_cleaned = gsub("[^\\(;]+\\(all\\)(;|$)?", "", subject_cleaned) # remove general subjects
  subject_cleaned = gsub("[^:;]+ ?:: ?[^;]+(;|$)?", "", subject_cleaned) #remove classification with separator ::
  subject_cleaned = gsub("[^\\[;]+\\[[A-Z,0-9]+\\](;|$)?", "", subject_cleaned) # remove WHO classification
  subject_cleaned = gsub("</keyword><keyword>", "", subject_cleaned) # remove </keyword><keyword>
  subject_cleaned = gsub("\\[[^\\[]+\\][^\\;]+(;|$)?", "", subject_cleaned) # remove classification
  subject_cleaned = gsub("[0-9]{2,} [A-Z]+[^;]*(;|$)?", "", subject_cleaned) #remove classification
  subject_cleaned = gsub(" -- ", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub(" \\(  ", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub("(\\w* \\w*(\\.)( \\w* \\w*)?)", "; ", subject_cleaned) # remove overly broad keywords separated by .
  subject_cleaned = gsub("\\. ", "; ", subject_cleaned) # replace inconsistent keyword separation
  subject_cleaned = gsub(" ?\\d[:?-?]?(\\d+.)+", "", subject_cleaned) # replace residuals like 5:621.313.323 or '5-76.95'
  subject_cleaned = gsub("\\w+:\\w+-(\\w+\\/)+", "", subject_cleaned) # replace residuals like Info:eu-repo/classification/

  metadata$subject = subject_cleaned

  metadata$authors = check_metadata(res$dccreator)

  metadata$link = check_metadata(res$dclink)
  metadata$oa_state = res$dcoa
  metadata$url = metadata$id
  metadata$relevance = c(nrow(metadata):1)

  text = data.frame(matrix(nrow=length(res$dcdocid)))
  text$id = metadata$id
  # Add all keywords, including classification to text
  text$content = paste(metadata$title, metadata$paper_abstract,
                       subject_all, metadata$published_in, metadata$authors,
                       sep=" ")

  ret_val=list("metadata" = metadata, "text"=text)

  end.time <- Sys.time()
  time.taken <- end.time - start.time
  blog$info(paste("Time taken:", time.taken, sep=" "))

  return(ret_val)

}
