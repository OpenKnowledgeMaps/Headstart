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
# * retry_opts: BASE retry options, see `?rbace::bs_retry_options` for documentation.
#  `?httr::RETRY` has more detailed explanation of the options. default values are used if
#   none are supplied.
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


get_papers <- function(query, params, limit=100,
                       filter=NULL,
                       retry_opts=rbace::bs_retry_options(3,60,3,4)) {

  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Search:", query))
  start.time <- Sys.time()

  # remove pluses between terms
  query_wt_plus = gsub("(?!\\B\"[^\"]*)[\\+]+(?![^\"]*\"\\B)", " ", query, perl=T)
  # remove multiple minuses and spaces after minuses
  query_wt_multi_minus = gsub("(?!\\B\"[^\"]*)((^|\\s))[\\-]+[\\s]*(?![^\"]*\"\\B)", "\\1-", query_wt_plus, perl=T)
  # remove multiple spaces inside the query
  query_wt_multi_spaces = gsub("(?!\\B\"[^\"]*)[\\s]{2,}(?![^\"]*\"\\B)", " ", query_wt_multi_minus, perl=T)
  # trim query, if needed
  query_cleaned = gsub("^\\s+|\\s+$", "", query_wt_multi_spaces, perl=T)

  # add "textus:" to each word/phrase to enable verbatim search
  # make sure it is added after any opening parentheses to enable queries such as "(a and b) or (a and c)"
  exact_query = gsub('([\"]+(.*?)[\"]+)|(?<=\\(\\b|\\+|-\\"\\b|\\s-\\b|^-\\b)|(?!or\\b|and\\b|[-]+[\\"\\(]*\\b)(?<!\\S)(?=\\S)(?!\\(|\\+)'
                     , "textus:\\1", query_cleaned, perl=T)

  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "exact query:", exact_query))

  year_from = params$from
  year_to = params$to

  # prepare query fields
  date_string = paste0("dcdate:[", params$from, " TO ", params$to , "]")
  document_types = paste("dctypenorm:", "(", paste(params$document_types, collapse=" OR "), ")", sep="")
  # language query field flag
  # CHANGE TO MORE LANGUAGES!!! look up dclang specifications
  lang_id <- params$lang_id
  if (!is.null(valid_langs$lang_id)) {
    lang_query <- paste0("dclang:", lang_id)
    } else {
    lang_query <- ""
  }
  sortby_string = ifelse(params$sorting == "most-recent", "dcyear desc", "")

  base_query <- paste(paste0("(",exact_query,")") ,lang_query, date_string, document_types, collapse=" ")

  min_descsize <- if (is.null(params$min_descsize)) 300 else params$min_descsize
  filter <- I(paste0('descsize:[', min_descsize, '%20TO%20*]'))
  
  repo = params$repo
  coll = params$coll
  
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "BASE query:", base_query))
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Sort by:", sortby_string))
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Min descsize:", min_descsize))
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Target:", repo))
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Collection:", coll))
  
  # execute search
  (res_raw <- bs_search(hits=limit
                        , query = base_query
                        , fields = "dcdocid,dctitle,dcdescription,dcsource,dcdate,dcsubject,dccreator,dclink,dcoa,dcidentifier,dcrelation,dctype,dctypenorm"
                        , sortby = sortby_string
                        , filter = filter
                        , target = repo
                        , coll = coll
                        , retry = retry_opts))
  res <- res_raw$docs
  if (nrow(res)==0){
    stop(paste("No results retrieved."))
  }

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
  subject_cleaned = gsub("\\[No keyword\\]", "", subject_cleaned)
  subject_cleaned = gsub("\\[[^\\[]+\\][^\\;]+(;|$)?", "", subject_cleaned) # remove classification
  subject_cleaned = gsub("[0-9]{2,} [A-Z]+[^;]*(;|$)?", "", subject_cleaned) #remove classification
  subject_cleaned = gsub(" -- ", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub(" \\(  ", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub("(\\w* \\w*(\\.)( \\w* \\w*)?)", "; ", subject_cleaned) # remove overly broad keywords separated by .
  subject_cleaned = gsub("\\. ", "; ", subject_cleaned) # replace inconsistent keyword separation
  subject_cleaned = gsub(" ?\\d[:?-?]?(\\d+.)+", "", subject_cleaned) # replace residuals like 5:621.313.323 or '5-76.95'
  subject_cleaned = gsub("\\w+:\\w+-(\\w+\\/)+", "", subject_cleaned) # replace residuals like Info:eu-repo/classification/
  subject_cleaned = gsub("^; $", "", subject_cleaned) # replace residuals like Info:eu-repo/classification/

  metadata$subject = subject_cleaned

  metadata$authors = check_metadata(res$dccreator)

  metadata$link = check_metadata(res$dclink)
  metadata$oa_state = res$dcoa
  metadata$url = metadata$id
  metadata$relevance = c(nrow(metadata):1)
  metadata$resulttype = lapply(res$dctypenorm, decode_dctypenorm)
  metadata$doi = unlist(lapply(metadata$link, find_dois))

  text = data.frame(matrix(nrow=length(res$dcdocid)))
  text$id = metadata$id
  # Add all keywords, including classification to text
  text$content = paste(metadata$title, metadata$paper_abstract,
                       subject_all, metadata$published_in, metadata$authors,
                       sep=" ")

  ret_val=list("metadata" = metadata, "text"=text)

  end.time <- Sys.time()
  time.taken <- end.time - start.time
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Time taken:", time.taken, sep=" "))

  return(ret_val)
}


find_dois <- function(link) {
  if ((startsWith(link, "http://doi.org"))
      || (startsWith(link, "https://doi.org"))
      || (startsWith(link, "http://dx.doi.org"))
      || (startsWith(link, "https://dx.doi.org"))) {
    doi <- stringr::str_replace(link, "http:", "https:")
  } else {
    doi <- ""
  }
  return(doi)
}


decode_dctypenorm <- function(dctypestring) {
  typecodes <- strsplit(dctypestring, "; ")
  typecodes <- lapply(typecodes, function(x) {dctypenorm_decoder[x]})
  typecodes <- unlist(unname(typecodes[[1]]))
  return(typecodes)
}

valid_langs <- list(
    'afr'='afrikaans',
    'akk'='akkadian',
    'ara'='arabic',
    'baq'='basque',
    'bel'='belarusian',
    'chi'='chinese',
    'cze'='czech',
    'dan'='danish',
    'dut'='dutch',
    'eng'='english',
    'est'='estonian',
    'fin'='finnish',
    'fre'='french',
    'geo'='georgian',
    'ger'='german',
    'gle'='irish',
    'glg'='galician',
    'grc'='greek',
    'gre'='greek',
    'heb'='hebrew',
    'hrv'='croatian',
    'hun'='hungarian',
    'ice'='icelandic',
    'ind'='indonesian',
    'ita'='italian',
    'jpn'='japanese',
    'kor'='korean',
    'lat'='latin',
    'lit'='lithuanian',
    'nau'='nauru',
    'nob'='norwegian',
    'nor'='norwegian',
    'ota'='turkish',
    'per'='persian',
    'pol'='polish',
    'por'='portuguese',
    'rum'='romanian',
    'rus'='russian',
    'slo'='slovak',
    'slv'='slovenian',
    'spa'='spanish',
    'srp'='serbian',
    'sux'='sumerian',
    'swe'='swedish',
    'tha'='thai',
    'tur'='turkish',
    'ukr'='ukrainian',
    'vie'='vietnamese'
)

dctypenorm_decoder <- list(
  "4"="Audio",
  "11"="Book",
  "111"="Book part",
  "13"="Conference object",
  "16"="Course material",
  "7"="Dataset",
  "5"="Image/video",
  "12"="Journal/newspaper",
  "121"="Journal/newspaper article",
  "122"="Journal/newspaper other content",
  "17"="Lecture",
  "19"="Manuscript",
  "3"="Map",
  "52"="Moving image/video",
  "2"="Musical notation",
  "F"="Other/Unknown material",
  "1A"="Patent",
  "14"="Report",
  "15"="Review",
  "6"="Software",
  "51"="Still image",
  "1"="Text",
  "18"="Thesis",
  "181"="Thesis: bachelor",
  "183"="Thesis: doctoral and postdoctoral",
  "182"="Thesis: master"
)
