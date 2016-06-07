library("rentrez")
library("data.table")
library("xml2")

# get_papers for Pubmed via Entrez API
#
# Params:
#
# * query: search query
# * params: parameters for the search in JSON format
#    * mindate: in the form YYYY/MM/DD
#    * maxdate: in the form YYYY/MM/DD
#    * article_types: in the form "journal article" (that's the default as well)
# * limit: number of search results to return
#
# It is expected that get_papers returns a list containing two data frames named "text" and "metadata"
#
# "text" contains the text for similarity analysis; it is expected to have two columns "id" and "content"
#
# "metadata" contains all metadata; has the following columns:
# * "id": the DOI
# * "pmid": the PMID
# * "title": the title
# * "authors": authors, in the format "LASTNAME1, FIRSTNAME1;LASTNAME2, FIRSTNAME2", split by ;
# * "paper_abstract": the abstract
# * "published_in": name of the journal or venue
# * "year": publication year
# * "date": publication date
# * "url": URL to the landing page
# * "subject": keywords, split by ;
#
# Examples:
# get_papers(query = "ecology")
# get_papers(query = "ecology", params = list(from = "2016/04/01", to = "2016/06/05"))
get_papers <- function(query, params = NULL, limit = 100) {

  fields <- c('.//ArticleTitle', './/MedlineCitation/PMID', './/Title', './/Abstract',
              './/MedlineCitation/DateCreated/Year')
  fnames <- c('title', 'pmid', 'published_in', 'paper_abstract', 'year')
  date <- './/MedlineCitation/DateCreated'
  authors <- './/AuthorList'
  keywords <- './/Keyword'
  doi <- ".//PubmedData/ArticleIdList/ArticleId[@IdType=\"doi\"]"
  query <- paste0(query, " \"journal article\"[Publication Type]")
  x <- rentrez::entrez_search(db = "pubmed", term = query, retmax = limit, mindate = params$from, maxdate = params$to)
  res <- rentrez::entrez_fetch(db = "pubmed", id = x$ids, rettype = "abstract")
  xml <- xml2::xml_children(xml2::read_xml(res))
  out <- lapply(xml, function(z) {
    tmp <- setNames(
      lapply(fields, function(w) xml2::xml_text(xml2::xml_find_all(z, w))),
      fnames
    )
    xdate <- paste0(vapply(xml2::xml_children(xml2::xml_find_all(z, date)), function(a) {
      xtext(a)
    }, ""), collapse = "-")
    xauthors <- paste0(vapply(xml2::xml_children(xml2::xml_find_all(z, authors)), function(a) {
      paste(
        xtext(xml2::xml_find_first(a, ".//LastName")),
        xtext(xml2::xml_find_first(a, ".//ForeName")),
        sep = ", "
      )
    }, ""), collapse = ";")
    xkeywords <- paste0(xtext(xml2::xml_find_all(z, keywords)), collapse = ";")
    xdoi <- xtext(xml2::xml_find_all(z, doi))
    lst <- c(tmp, date = xdate, id = xdoi, authors = list(xauthors), subject = list(xkeywords))
    lst[vapply(lst, length, 1) != 1] <- NA
    return(lst)
  })
  df <- data.table::setDF(data.table::rbindlist(out, fill = TRUE, use.names = TRUE))
  df <- setNames(df, tolower(names(df)))
  df$url <- paste0("http://www.ncbi.nlm.nih.gov/pubmed/", df$pmid)

  return(list(metadata = df, text = df[,c('id', 'paper_abstract')]))
}

xtext <- function(x) xml2::xml_text(x)
