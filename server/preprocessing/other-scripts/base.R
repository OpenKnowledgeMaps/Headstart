library(rbace)
library(stringr)
library(dplyr)
source('preprocess.R')

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

get_papers <- function(query, params,
                       retry_opts=rbace::bs_retry_options(3,60,3,4)) {

  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Search:", query))
  start.time <- Sys.time()

  if (!is.null(query)) {
    exact_query <- preprocess_query((query))
  } else {
    exact_query <- NULL
  }

  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "exact query:", exact_query))

  limit = params$limit

  # prepare query fields
  document_types = paste("dctypenorm:", "(", paste(params$document_types, collapse=" OR "), ")", sep="")
  
  sortby_string = ifelse(params$sorting == "most-recent", "dcyear desc", "")
  return_fields <- "dcdocid,dctitle,dcdescription,dcsource,dcdate,dcsubject,dccreator,dclink,dcoa,dcidentifier,dcrelation,dctype,dctypenorm,dcprovider,dclang,dclanguage,dccoverage,dccollection,dcdoi"

  if (!is.null(exact_query) && exact_query != '') {
    base_query <- paste(paste0("(",exact_query,")"), document_types, collapse=" ")
  } else {
    base_query <- paste(document_types, collapse=" ")
  }

  if (!is.null(params$vis_type) && params$vis_type == "timeline") {
    if (!is.null(params$exclude_date_filters)) {
      params$exclude_date_filters <- NULL
    }
  }

  if (!is.null(params$exclude_date_filters)
      && (params$exclude_date_filters == TRUE || params$exclude_date_filters == "true")) {
  } else {
    date_string = paste0("dcdate:[", params$from, " TO ", params$to , "]")
    base_query <- paste(date_string, base_query)
  }

  # apply language filter if parameter is set
  lang_id <- params$lang_id
  if (!is.null(lang_id) && lang_id != "all-lang") {
    lang_query = paste("dclang:", "(", paste(params$lang_id, collapse=" OR "), ")", sep="")
    base_query <- paste(base_query, lang_query)
  }
    
  q_advanced = params$q_advanced
  if (!is.null(q_advanced)) {
    base_query <- paste(base_query, q_advanced)
  }

  if (!is.null(params$q_advanced_only)
      && (params$q_advanced_only == TRUE || params$q_advanced_only == "true")) {
    base_query <- q_advanced
  }

  min_descsize <- if (is.null(params$min_descsize)) 300 else params$min_descsize
  filter <- I(paste0('descsize:[', min_descsize, '%20TO%20*]'))
  limit <- params$limit

  repo = params$repo
  coll = params$coll
  if(!is.null(repo) && repo=="fttriple") {
    non_public = TRUE
  } else {
    non_public = FALSE
  }

  cc <- params$custom_clustering
  if (!is.null(cc)) {
    if (cc %in% names(fieldmapper)) {
      # this is the generic case for existing metadata
      custom_clustering_query <- paste(fieldmapper[[cc]], ":", "*", sep="")
      base_query <- paste(base_query, custom_clustering_query)
    } else {
      # this is the speciality case for custom clustering on annotations
      custom_clustering_query <- paste("dcsubject:", cc, "*", sep="")
      base_query <- paste(base_query, custom_clustering_query)
      custom_clustering_query <- paste('textus:', '"', cc, ':"', sep="")
      base_query <- paste(base_query, custom_clustering_query)
      custom_clustering_query <- paste(cc, ':*', sep="")
      base_query <- paste(base_query, custom_clustering_query)
    }
  }

  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "BASE query:", base_query))

  # execute search
  offset = 0
  res_raw <- get_raw_data(limit,
                          base_query,
                          return_fields,
                          sortby_string,
                          filter,
                          repo,
                          coll,
                          retry_opts,
                          offset,
                          non_public)
  res <- res_raw$docs
  if (nrow(res)==0){
    stop(paste("No results retrieved."))
  }
  metadata <- etl(res, repo, non_public)
  metadata <- sanitize_abstract(metadata)
  metadata <- mark_duplicates(metadata)
  metadata$has_dataset <- unlist(lapply(metadata$resulttype, function(x) "Dataset" %in% x))
  
  req_limit <- 9
  r <- 0
  # check if custom clustering annotation param is in metadata
  if (!is.null(cc)) {
    if (!(cc %in% names(fieldmapper))) {
      has_custom_clustering_annotation <- unlist(lapply(metadata$subject_orig, function(x) grepl(paste0(cc, ":"), x, fixed=TRUE)))
      metadata <- metadata[has_custom_clustering_annotation,]
  }}

  while (nrow(metadata) - sum(metadata$is_duplicate) < limit && attr(res_raw, "numFound") > offset+120 && r < req_limit) {
    offset <- offset+120
    res_raw <- get_raw_data(limit,
                            base_query,
                            return_fields,
                            sortby_string,
                            filter,
                            repo,
                            coll,
                            retry_opts,
                            offset,
                            non_public)
    res <- bind_rows(res, res_raw$docs)
    metadata <- etl(res, repo, non_public)
    metadata <- unique(metadata, by = "id")
    metadata <- sanitize_abstract(metadata)
    metadata <- mark_duplicates(metadata)
    metadata$has_dataset <- unlist(lapply(metadata$resulttype, function(x) "Dataset" %in% x))
    # check if custom clustering annotation param is in metadata
    if (!is.null(cc)) {
      if (!(cc %in% names(fieldmapper))) {
        has_custom_clustering_annotation <- unlist(lapply(metadata$subject_orig, function(x) grepl(paste0(cc, ":"), x, fixed=TRUE)))
        metadata <- metadata[has_custom_clustering_annotation,]
    }}
    r <- r+1
  }
  # check if custom clustering annotation param is in metadata
  if (!is.null(cc)) {
    if (!(cc %in% names(fieldmapper))) {
      has_custom_clustering_annotation <- unlist(lapply(metadata$subject_orig, function(x) grepl(paste0(cc, ":"), x, fixed=TRUE)))
      metadata <- metadata[has_custom_clustering_annotation,]
  }}
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Deduplication retrieval requests:", r))

  metadata <- unique(metadata, by = "id")
  # Add all keywords, including classification to text content for clustering
  text <- data.frame(id = metadata$id,
                     content = paste(metadata$title, metadata$paper_abstract,
                                     metadata$subject_orig, metadata$published_in, metadata$authors,
                                     sep=" "))


  input_data=list("metadata" = metadata, "text"=text)

  end.time <- Sys.time()
  time.taken <- end.time - start.time
  blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Time taken:", time.taken, sep=" "))

  return(input_data)
}

etl <- function(res, repo, non_public) {
  metadata = data.frame(matrix(nrow=length(res$dcdocid)))

  metadata$id = res$dcdocid
  metadata$relation = check_metadata(res$dcrelation)
  metadata$identifier = check_metadata(res$dcidentifier)
  metadata$title = check_metadata(res$dctitle)
  metadata$title = gsub(" \\.\\.\\.$", "", metadata$title)
  metadata$paper_abstract = check_metadata(res$dcdescription)
  metadata$published_in = check_metadata(res$dcsource)
  metadata$year = check_metadata(res$dcdate)

  subject_all = check_metadata(res$dcsubject)

  metadata$subject_orig = subject_all

  subject_cleaned = gsub("DOAJ:[^;]*(;|$)?", "", subject_all) # remove DOAJ classification
  subject_cleaned = gsub("/dk/atira[^;]*(;|$)?", "", subject_cleaned) # remove atira classification
  subject_cleaned = gsub("ddc:[0-9]+(;|$)?", "", subject_cleaned) # remove Dewey Decimal Classification
  subject_cleaned = gsub("([\\w\\/\\:-])*?\\/ddc\\/([\\/0-9\\.])*", "", subject_cleaned) # remove Dewey Decimal Classification in URI form
  subject_cleaned = gsub("[A-Z,0-9]{2,}-[A-Z,0-9\\.]{2,}(;|$)?", "", subject_cleaned) #remove LOC classification
  subject_cleaned = gsub("[^\\(;]+\\(General\\)(;|$)?", "", subject_cleaned) # remove general subjects
  subject_cleaned = gsub("[^\\(;]+\\(all\\)(;|$)?", "", subject_cleaned) # remove general subjects
  subject_cleaned = gsub("[^:;]+ ?:: ?[^;]+(;|$)?", "", subject_cleaned) #remove classification with separator ::
  subject_cleaned = gsub("[^\\[;]+\\[[A-Z,0-9]+\\](;|$)?", "", subject_cleaned) # remove WHO classification
  subject_cleaned = gsub("Info:\\w+-(\\w+\\/)+", "", subject_cleaned) # remove Info:eu-repo/classification/
  subject_cleaned = gsub("([A-Za-z]+:[A-Za-z0-9 \\/\\.-]+);?", "", subject_cleaned, perl=TRUE) # clean up annotations with prefix e.g. theme:annotation
  if (!is.null(params$vis_type) && params$vis_type == "timeline") {
    subject_cleaned = gsub("FOS ", "", subject_cleaned) # remove FOS classification tag, but keep classifcation name
    arxiv_classification_string = "(cs|econ|eess|math|astro-ph|nlin|q-bio|q-fin|stat)\\.[A-Z]{2}|cond-mat\\.[a-z\\-]+|hep-(ex|lat|ph|th)|math-ph|nucl-(ex|th)|physics\\.[a-z\\-]+|(astro-ph|gr-qc|quant-ph|cond-mat)"
    subject_cleaned = gsub(arxiv_classification_string, "", subject_cleaned, perl=TRUE) # remove arXiv classification short code, but keep classifcation name
  } else {
    subject_cleaned = gsub("FOS [A-Za-z ]+", "", subject_cleaned) # remove FOS classifications (Fields of Science and Technology)
    arxiv_classification_string = "(([A-Za-z ]+ )?cond-mat\\.[a-z\\-]+)|([\\w ]+ )?(cs|econ|eess|math|astro-ph|nlin|q-bio|q-fin|stat)\\.[A-Z]{2}|cond-mat\\.[a-z\\-]+|hep-(ex|lat|ph|th)|math-ph|nucl-(ex|th)|physics\\.[a-z\\-]+|([\\w ]+ )(astro-ph|gr-qc|quant-ph|cond-mat)"
    subject_cleaned = gsub(arxiv_classification_string, "", subject_cleaned, perl=TRUE) # remove arXiv classification, except on streamgraphs    
  }
  subject_cleaned = gsub("([A-Za-z]+:[A-Za-z0-9 \\/\\.]+);?", "", subject_cleaned, perl=TRUE) # clean up annotations with prefix e.g. theme:annotation
  subject_cleaned = gsub("(wikidata)?\\.org/entity/[qQ]([\\d]+)?", "", subject_cleaned) # remove wikidata classification
  subject_cleaned = gsub("</keyword><keyword>", "", subject_cleaned) # remove </keyword><keyword>
  subject_cleaned = gsub("\\[No keyword\\]", "", subject_cleaned)

  if (!is.null(params$vis_type) && params$vis_type == "timeline") {
    subject_cleaned = remove_keywords_with_text_in_square_brackets(subject_cleaned)
  } else {
    # de-invert comma-inverted MeSH descriptors (marker preserved).
    # Runs before the marker-stripping steps so [MeSH]/(mesh) are still present.
    subject_cleaned = deinvert_marked_mesh_keywords(subject_cleaned)
    # drop whole keywords that are additional classifications. Runs before the
    # bracket strip so leading-bracket classifications (e.g. HAL [SHS.ECO]...)
    # are still intact.
    subject_cleaned = clean_classification_keywords(subject_cleaned)
    # strip the "(mesh)" marker ("[MeSH]" is handled just below).
    subject_cleaned = remove_mesh_round_bracket_marker(subject_cleaned)
    subject_cleaned = remove_text_in_square_brackets_from_keywords(subject_cleaned)
  }

  subject_cleaned = gsub("\\[[^\\[]+\\][^\\;]+(;|$)?", "", subject_cleaned) # remove classification
  subject_cleaned = gsub("[0-9]{2,} [A-Z]+[^;]*(;|$)?", "", subject_cleaned) #remove classification
  subject_cleaned = gsub(" -- ", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub("[-]{2,}", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub("[A-Z]\\.\\d\\.\\d+", "", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub(" \\(  ", "; ", subject_cleaned) #replace inconsistent keyword separation
  subject_cleaned = gsub("(\\w* \\w*(\\.)( \\w* \\w*)?)", "; ", subject_cleaned) # remove overly broad keywords separated by .
  subject_cleaned = gsub("\\. ", "; ", subject_cleaned) # replace inconsistent keyword separation
  subject_cleaned = gsub(" ?\\d[:?-?]?(\\d+.)+", "", subject_cleaned) # replace residuals like 5:621.313.323 or '5-76.95'
  subject_cleaned = gsub(": ", "", subject_cleaned) # clean up keyword separation
  subject_cleaned = gsub("^; $", "", subject_cleaned) # clean up keyword separation
  subject_cleaned = gsub(";+", ";", subject_cleaned) # clean up keyword separation
  subject_cleaned = gsub(",+", ",", subject_cleaned) # clean up keyword separation
  subject_cleaned = gsub(",", ", ", subject_cleaned) # clean up keyword separation
  subject_cleaned = gsub("\\s+", " ", subject_cleaned) # clean up keyword separation
  subject_cleaned = stringi::stri_trim(subject_cleaned) # clean up keyword separation
  metadata$subject = subject_cleaned

  metadata$authors = check_metadata(res$dccreator)

  metadata$link = check_metadata(res$dclink)
  metadata$oa_state = res$dcoa
  metadata$url = metadata$id
  metadata$relevance = c(nrow(metadata):1)
  metadata$resulttype = lapply(res$dctypenorm, decode_dctypenorm)
  metadata$type = check_metadata(res$dctype)
  metadata$typenorm = check_metadata(res$dctypenorm) 
  metadata$doi = unlist(lapply(metadata$link, find_dois))
  metadata$doi_merge = unlist(lapply(metadata$link, find_dois))
  metadata$additional_dois = check_metadata(res$dcdoi)
  metadata$additional_dois = check_metadata(lapply(metadata$additional_dois, normalize_dois))
  # Fill primary doi for the ORCID enrichment
  # from additional_dois when find_dois(link) returned nothing
  # but dcdoi contains exactly one entry. Guarded to the single-entry case
  # because doi_merge field expects to contain a single DOI
  # and we want to avoid filling it with multiple DOIs separated by ;
  # Enrichment from multiple DOIs is happening in the enrichment step and not in the search step
  additional_dois_char <- vapply(metadata$additional_dois, function(x) {
    if (length(x) == 0) "" else as.character(x)[1]
  }, character(1))
  needs_doi_fill <- (is.na(metadata$doi_merge) | metadata$doi_merge == "") &
                    !is.na(additional_dois_char) &
                    additional_dois_char != "" &
                    !grepl(";", additional_dois_char, fixed = TRUE)
  metadata$doi_merge[needs_doi_fill] <- additional_dois_char[needs_doi_fill]
  metadata$lang = check_metadata(res$dclang)
  metadata$language = check_metadata(res$dclanguage)
  metadata$content_provider = check_metadata(res$dcprovider)
  metadata$coverage = check_metadata(res$dccoverage)
  metadata$collection = check_metadata(res$dccollection)
  if(repo=="fttriple" && non_public==TRUE) {
    metadata$content_provider <- "GoTriple"
  }

  return (metadata)
}


preprocess_query <- function(query) {
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
  return(exact_query)
}


get_raw_data <- function(limit, base_query, return_fields, sortby_string, filter, repo, coll, retry_opts, offset, non_public) {
  t <- 0
  while (t < retry_opts$times) {
    res_raw <- try(
      (bs_search(hits=limit
                  , fields = return_fields,
                  , query = base_query
                  , sortby = sortby_string
                  , filter = filter
                  , target = repo
                  , coll = coll
                  , retry = retry_opts
                  , offset = offset
                  , non_public = non_public)))
    if (inherits(res_raw, "try-error")) {
      if (grepl("Timeout was reached: [api.base-search.net]", res_raw, fixed=TRUE)) {
        t <- t + 1
        Sys.sleep(2)
        blog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "BASE API Timeout retry attempt:", t, sep=" "))
      } else {
        stop("Timeout was reached: [api.base-search.net]")
      }
    } else {
      break
    }
  }
  return(res_raw)
}


find_dois <- function(link) {
  if ((startsWith(link, "http://doi.org"))
      || (startsWith(link, "https://doi.org"))
      || (startsWith(link, "http://dx.doi.org"))
      || (startsWith(link, "https://dx.doi.org"))) {
    doi <- str_replace(link, "http:", "https:")
  } else {
    doi <- ""
  }
  return(doi)
}

normalize_dois <- function(doi_string) {
  dois <- strsplit(doi_string, ";")[[1]]
  dois <- trimws(dois)
  dois <- dois[!is.na(dois) & nchar(dois) > 0]

  if (length(dois) == 0) {
    return("")
  }

  dois_cleaned <- gsub("^https?://(dx\\.)?doi\\.org/", "", dois, ignore.case = TRUE)
  result <- paste0("https://doi.org/", dois_cleaned)
  final_result <- paste(result, collapse = "; ")

  return(final_result)
}


decode_dctypenorm <- function(dctypestring) {
  typecodes <- strsplit(dctypestring, "; ")
  typecodes <- lapply(typecodes, function(x) {dctypenorm_decoder[x]})
  typecodes <- unlist(unname(typecodes[[1]]))
  return(typecodes)
}

remove_keywords_with_text_in_square_brackets <- function(x) {
  # This function removes whole keywords that contain text in square brackets.
  # Example: 'Climate [MeSH]' | 'Some keywords [Chemical]'.
  gsub("[^;]*\\[[^]]+\\][^;]*;?", "", x)
}

remove_text_in_square_brackets_from_keywords <- function(x) {
  # This function removes text in square brackets.
  # Example: 'Climate [MeSH]' -> 'Climate'| 'Some keywords [Chemical]' -> 'Some keywords'.
  gsub("\\[[^]]*\\]", "", x)
}

# --- MeSH keyword handling (label improvements) -------------------
# Applied only in the non-"timeline" branch (see vis_layout subject cleaning).

remove_mesh_round_bracket_marker <- function(x) {
  # remove the "(mesh)" marker from keywords (case-insensitive),
  # mirroring remove_text_in_square_brackets_from_keywords for the "[MeSH]" form.
  # Only the literal "(mesh)" marker is removed -- NOT other parentheses, which
  # carry real keyword content. Example: 'Climate (mesh)' -> 'Climate'.
  gsub("\\s*\\(mesh\\)", "", x, ignore.case = TRUE)
}

# Reversal-exclusion set for MeSH de-inversion. Bare descriptors
# listed here are kept in their original order instead of being reversed. To be
# populated from the manual review of multi-comma MeSH descriptors;
MESH_DEINVERSION_EXCLUSIONS <- c(
  "Human Papillomavirus Recombinant Vaccine Quadrivalent, Types 6, 11, 16, 18",
  "Dibenz(b,f)(1,4)oxazepine-10(11H)-carboxylic acid, 8-chloro-, 2-acetylhydrazide",
  "Technology, Industry, and Agriculture",
  "Multi-Ingredient Cold, Flu, and Allergy Medications",
  "National Heart, Lung, and Blood Institute (U.S.)",
  "Disruptive, Impulse Control, and Conduct Disorders",
  "Health Care Quality, Access, and Evaluation",
  "Gram-Negative Anaerobic Straight, Curved, and Helical Rods",
  "Hormones, Hormone Substitutes, and Hormone Antagonists",
  "Vaginal Creams, Foams, and Jellies",
  "Neoplasms, Ductal, Lobular, and Medullary",
  "Congenital, Hereditary, and Neonatal Diseases and Abnormalities",
  "Nucleobase, Nucleoside, Nucleotide, and Nucleic Acid Transport Proteins",
  "Nucleic Acids, Nucleotides, and Nucleosides",
  "Diet, Food, and Nutrition",
  "Amino Acids, Peptides, and Proteins",
  "Neoplasms, Cystic, Mucinous, and Serous",
  "Benzenaminium, 4,4'-(3-oxo-1,5-pentanediyl)bis(N,N-dimethyl-N-2-propenyl-), Dibromide",
  "3-Pyridinecarboxylic acid, 1,4-dihydro-2,6-dimethyl-5-nitro-4-(2-(trifluoromethyl)phenyl)-, Methyl ester",
  "Pneumonia, Atypical Interstitial, of Cattle",
  "Pneumonia, Progressive Interstitial, of Sheep",
  "Epidermitis, Exudative, of Swine",
  "Gastroenteritis, Transmissible, of Swine",
  "Enteritis, Transmissible, of Turkeys",
  "Anemia, Refractory, with Excess of Blasts"
)

deinvert_mesh_term <- function(term) {
  # Naive de-inversion: reverse the comma-separated parts and join with a space.
  # "Adaptation, Physiological" -> "Physiological Adaptation"; "A, B, C" -> "C B A".
  # Terms in MESH_DEINVERSION_EXCLUSIONS are left untouched.
  if (term %in% MESH_DEINVERSION_EXCLUSIONS) return(term)
  if (!grepl(",", term, fixed = TRUE)) return(term)
  parts <- trimws(strsplit(term, ",", fixed = TRUE)[[1]])
  paste(rev(parts), collapse = " ")
}

deinvert_marked_mesh_keywords <- function(x) {
  # de-invert comma-inverted MeSH descriptors for readability. Only
  # keywords carrying a [MeSH] or (mesh) marker are affected; the marker is
  # preserved here and removed by the marker-stripping steps that follow.
  marker_re <- "\\s*(\\[MeSH\\]|\\(mesh\\))\\s*$"
  one <- function(subject) {
    if (is.na(subject) || subject == "") return(subject)
    kws <- trimws(strsplit(subject, ";", fixed = TRUE)[[1]])
    out <- vapply(kws, function(kw) {
      if (!grepl(marker_re, kw, ignore.case = TRUE, perl = TRUE)) return(kw)
      marker <- regmatches(kw, regexpr(marker_re, kw, ignore.case = TRUE, perl = TRUE))
      bare <- sub(marker_re, "", kw, ignore.case = TRUE, perl = TRUE)
      paste0(deinvert_mesh_term(trimws(bare)), marker)
    }, character(1), USE.NAMES = FALSE)
    paste(out, collapse = "; ")
  }
  vapply(x, one, character(1), USE.NAMES = FALSE)
}

# --- Classification keyword cleanup ------------------------------------------
# Split the subject into a keyword vector, run individual filter functions that
# drop whole classification keywords, then rejoin. Each classification is one
# small, self-contained filter, which keeps the rules readable and testable.

split_keywords <- function(subject) {
  kws <- trimws(strsplit(subject, ";", fixed = TRUE)[[1]])
  kws[nzchar(kws)]
}

join_keywords <- function(keywords) {
  paste(keywords, collapse = "; ")
}

# Each drop_* filter takes a character vector of keywords and returns it with
# the keywords belonging to that classification removed.

drop_keyvalue <- function(keywords) {
  # key=value annotations, e.g. "name=Bristol Population Health Science Institute".
  keywords[!grepl("^name=", keywords, ignore.case = TRUE)]
}

drop_rcdc <- function(keywords) {
  # NIH RCDC, e.g. "Autism (rcdc)".
  keywords[!grepl("\\(rcdc\\)\\s*$", keywords, ignore.case = TRUE)]
}

drop_not_elsewhere_classified <- function(keywords) {
  # "... not elsewhere classified" residue, e.g. "Biological Sciences not elsewhere classified".
  keywords[!grepl("not elsewhere classified", keywords, ignore.case = TRUE)]
}

drop_for <- function(keywords) {
  # ANZSRC Fields of Research, three serialisations:
  #   "01 Mathematical Sciences (for)", "38 Economics (for-2020)", "FoR 03 (Chemical Sciences)".
  # The FoR-prefix form requires a letter after "(" so a stray "... (89.8%)" is not matched.
  keywords[!grepl("\\(for(-2020)?\\)\\s*$|^FoR [0-9]+ \\([A-Za-z]", keywords, ignore.case = TRUE)]
}

drop_hrcs <- function(keywords) {
  # UK Health Research Classification System, e.g. "... (hrcs-rac)", "... (hrcs-hc)".
  keywords[!grepl("\\(hrcs-[a-z]+\\)\\s*$", keywords, ignore.case = TRUE)]
}

drop_science_metrix <- function(keywords) {
  # Science-Metrix, e.g. "Bioinformatics (science-metrix)".
  keywords[!grepl("\\(science-metrix\\)\\s*$", keywords, ignore.case = TRUE)]
}

drop_sdg <- function(keywords) {
  # UN Sustainable Development Goals, e.g. "3 Good Health and Well Being (sdg)".
  keywords[!grepl("\\(sdg\\)\\s*$", keywords, ignore.case = TRUE)]
}

drop_acm_ccs <- function(keywords) {
  # ACM Computing Classification System concept path, e.g.
  # "Computing methodologies -> Machine learning" (the arrow is U+2192).
  keywords[!grepl("→", keywords, fixed = TRUE)]
}

drop_hal_shs <- function(keywords) {
  # HAL domains: a leading bracket with one of the 13 top-level codes, optionally
  # followed by dotted uppercase sub-codes, e.g. "[SHS.ECO]Humanities and ...".
  # Case-sensitive: the codes are upper-case (lower-case look-alikes are not HAL).
  pat <- "^\\[(CHIM|INFO|MATH|NLIN|PHYS|SCCO|SDE|SDU|SDV|SHS|SPI|STAT|QFIN)(\\.[A-Z-]+)*\\]"
  keywords[!grepl(pat, keywords)]
}

drop_url <- function(keywords) {
  # URLs leaking in as keywords, e.g. supplementary-file links.
  keywords[!grepl("^https?://", keywords, ignore.case = TRUE)]
}

drop_numeric_path <- function(keywords) {
  # Numeric ontology path codes (digits and slashes only), e.g. "/692/308/174".
  keywords[!grepl("^[0-9/]*/[0-9/]*$", keywords)]
}

# Toulouse Capitole (TSE) subject headings (top level + sub-categories),
# hardcoded from https://publications.ut-capitole.fr/view/subjects/ . A keyword
# equal to one of these (e.g. "B- ECONOMIE et FINANCE") is a subject
# classification, not a topic.
TOULOUSE_SUBJECTS <- c(
  "A- DROIT",
  "A1- Généralités",
  "A1-1- Introduction au droit",
  "A1-2- Philosophie du droit",
  "A1-3- Sociologie juridique",
  "A1-4- Droit de l'informatique",
  "A1-5- Droit et religions",
  "A1-6- Organisation judiciaire",
  "A1-7- Sources du droit",
  "A1-8- Principes généraux du droit",
  "A1-9- Anthropologie juridique",
  "A2- Histoire du droit",
  "A2-1- Droit romain et droits de l'Antiquité",
  "A2-2- Histoire du droit et des institutions",
  "A2-3- Histoire du droit privé",
  "A3- Droit public",
  "3-1- Droit constitutionnel",
  "3-3- Droit administratif",
  "3-3- Libertés publiques",
  "3-4- Finances publiques",
  "3-5- Droit de l'urbanisme",
  "3-6- Droit de la santé publique",
  "3-7- Droit de l'information, de la communication, droit de la presse",
  "3-8- Droit public économique et des affaires",
  "A4- Droit privé",
  "4-1- Droit civil",
  "4-10- Droit de l'environnement",
  "4-11- Droit médical",
  "4-12- Droit de l'information, de la communication, droit de la presse",
  "4-13- Droit du sport",
  "4-14- Droit du tourisme",
  "4-2- Droit des affaires – droit commercial",
  "4-3- Droit social – droit du travail",
  "4-4- Droit fiscal",
  "4-5- Droit des transports",
  "4-6- Droit des assurances",
  "4-7- Droit de la propriété intellectuelle ( littéraire, artistique, industrielle)",
  "4-8- Droit de la construction – droit immobilier",
  "4-9- Droit rural",
  "A5- Droit pénal",
  "5-1- Droit pénal – Procédure pénale",
  "5-2- Droit pénal des affaires – droit pénal spécial",
  "5-3- Pénologie – Science pénitentiaire",
  "5-4- Criminologie",
  "A6- Droit international",
  "6-1- Droit international privé",
  "6-2- Droit international public",
  "6-3- Droit international économique",
  "A7- Droit comparé",
  "7-1- Grands systèmes de droit",
  "7-2- Droit des pays étrangers",
  "A8- Droit de l'Union Européenne",
  "8-1- Sources",
  "8-2- Institutions",
  "8-3- Droit substantiel",
  "B- ECONOMIE ET FINANCE",
  "B1- Généralités",
  "B2- Production. Travail",
  "B3- Transport et Communication",
  "B4- Commerce et Affaire",
  "B5- Finances",
  "C- GESTION",
  "C1- Généralités",
  "C2- Comptabilité – Contrôle",
  "C3- Gestion ressources humaines",
  "C4- Management",
  "C5- Marketing",
  "C6- Stratégie",
  "D- SCIENCES POLITIQUES",
  "D1- Généralités",
  "D2- Politique",
  "D3- Institution et Administration",
  "D4- Relations internationales",
  "E- SCIENCES DE L'INFORMATION ET DE LA COMMUNICATION",
  "E1- Généralités",
  "E2- Communication",
  "E3- Culture et Media",
  "F- SCIENCES HUMAINES",
  "F1- Histoire. Géographie",
  "F2- Sociologie",
  "G- MATHEMATIQUES",
  "H- INFORMATIQUE",
  "I- LANGUE",
  "J- SPORT"
)

normalize_subject <- function(x) {
  # Case-fold and normalise curly apostrophes so keyword variants (lower-case,
  # curly quotes) match the canonical list.
  toupper(gsub("[‘’']", "'", trimws(x)))
}

drop_letter_domain <- function(keywords) {
  # Exact (normalised) match against the hardcoded Toulouse subject list.
  keywords[!(normalize_subject(keywords) %in% normalize_subject(TOULOUSE_SUBJECTS))]
}

# drop_domain_general <- function(keywords) {
#   # Library of Congress "(General)" subjects, e.g. "Biology (General)".
#   # Currently removed by the legacy gsub chain; enable when that is retired.
#   keywords[!grepl("\\([Gg]eneral\\)\\s*$", keywords)]
# }

clean_classification_keywords <- function(x) {
  one <- function(subject) {
    if (is.na(subject) || subject == "") return(subject)
    keywords <- split_keywords(subject)
    keywords <- drop_keyvalue(keywords)
    keywords <- drop_rcdc(keywords)
    keywords <- drop_not_elsewhere_classified(keywords)
    keywords <- drop_for(keywords)
    keywords <- drop_hrcs(keywords)
    keywords <- drop_science_metrix(keywords)
    keywords <- drop_sdg(keywords)
    keywords <- drop_acm_ccs(keywords)
    keywords <- drop_hal_shs(keywords)
    keywords <- drop_url(keywords)
    keywords <- drop_numeric_path(keywords)
    keywords <- drop_letter_domain(keywords)
    # keywords <- drop_domain_general(keywords)  # handled by legacy chain for now
    join_keywords(keywords)
  }
  vapply(x, one, character(1), USE.NAMES = FALSE)
}

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

fieldmapper <- list(
  "relation"="dcrelation",
  "identifier"="identifier",
  "title"="dctitle",
  "paper_abstract"="dcdescription",
  "published_in"="dcsource",
  "year"="dcdate",
  "subject"="dcsubject",
  "authors"="dccreator",
  "link"="dclink",
  "oa_state"="dcoa",
  "url"="dcdocid",
  "relevance"="relevance",
  "resulttype"="dctypenorm",
  "type"="dctype",
  "typenorm"="dctypenorm",
  "doi"="doi",
  "lang"="dclang",
  "language"="dclanguage",
  "content_provider"="dcprovider",
  "coverage"="dccoverage",
  "collection"="dccollection"
)