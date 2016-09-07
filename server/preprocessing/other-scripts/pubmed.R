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
  from = gsub("-", "/", params$from)
  to = gsub("-", "/", params$to)
  article_types_string = paste0(" ((", '"', paste(params$article_types, sep='"', collapse='"[Publication Type] OR "'), '"[Publication Type]))')
  query <- paste0(query, article_types_string)
  x <- rentrez::entrez_search(db = "pubmed", term = query, retmax = limit, mindate = from, maxdate = to, sort="relevance")
  res <- rentrez::entrez_fetch(db = "pubmed", id = x$ids, rettype = "xml")
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
  df$paper_abstract <- gsub("^\\s+|\\s+$", "", gsub("[\r\n]", "", df$paper_abstract))
  df$content <- paste(df$title, df$paper_abstract, df$authors, df$subject, df$published_in, sep= " ")
  df$doi = df$id
  df$id = df$pmid
  
  summary <- rentrez::entrez_summary(db="pubmed", id = x$ids)
  df$readers <- extract_from_esummary(summary, "pmcrefcount")
  df$readers <- replace(df$readers, df$readers=="", 0)
  
  oa = c()
  idlist = extract_from_esummary(summary, "articleids")
  
  for(i in 1:nrow(df)) {
    current_ids = idlist[,i]
    current_pmcid = current_ids$value[current_ids$idtype=="pmc"]
    if(identical(current_pmcid, character(0))) {
      current_oa = FALSE;
    } else {
      current_oa = TRUE;
    }
    oa[i] = current_oa
  }
  
  df$oa = oa
  
  return(list(metadata = df, text = df[,c('id', 'content')]))
}

xtext <- function(x) xml2::xml_text(x)
