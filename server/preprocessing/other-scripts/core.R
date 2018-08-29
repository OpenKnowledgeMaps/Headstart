library(rcoreoa)

# get_papers
#
# Params:
#
# * query: search query
# * params: parameters for the search in JSON format
#   * "query" (character) query string, required
#   * "page" (character) page number (default: 1)
#   * "limit" (character) records to return (default: 10, minimum: 10)
#   * "metadata" (logical) Whether to retrieve the full article metadata or only the ID. Default: `TRUE`
#   * "fulltext" (logical) Whether to retrieve full text of the article. Default: `FALSE`
#   * "citations" (logical) Whether to retrieve citations found in the article. Default: `FALSE`
#   * "similar" (logical) Whether to retrieve a list of similar articles.  Default: `FALSE`. Because the similar articles are calculated on demand, setting this parameter to true might slightly slow down the response time
#   * "duplicate" (logical) Whether to retrieve a list of CORE IDs of different versions of the article. Default: `FALSE`
#   * "urls" (logical) Whether to retrieve a list of URLs from which the article can be downloaded. This can include links to PDFs as well as  HTML pages. Default: `FALSE`
#   * "faithfulMetadata" (logical) Returns the records raw XML metadata  from the original repository. Default: `FALSE`
#   * "key" A CORE API key. Get one at https://core.ac.uk/api-keys/register. Once you have the key, you can pass it into this parameter, or as a much better option, store your key as an environment variable with the name CORE_KEY or an R option as core_key.
#   * "..." Curl options passed to crul::HttpClient
#   * "parse" (logical) Whether to parse to list `FALSE` or data.frame (`TRUE`; default)
# * limit: number of search results to return
#
# It is expected that get_papers returns a list containing two data frames named "text" and "metadata"
#
# "text" contains the text for similarity analysis; it is expected to have two columns "id" and "content"
#
# "metadata" contains all metadata; its columns are expected to be named as follows:
# * id
# * authors
# * contributors
# * datePublished
# * description
# * identifiers
# * language
# * publisher
# * relations
# * repositories
# * subjects
# * title
# * topics
# * types
# * year
# * fulltextIdentifier
# * oai
# * downloadUrl
# * journals
# * doi
#
# Examples:
# x <- get_papers(query = "ecology", limit = 10)
# head(x$metadata)
# x$text$id
# x$text$content
# cat(x$text$content[1])
get_papers <- function(query, params = list(), limit=100) {
  core_query <- build_query(query, params)
  ids <- core_advanced_search(core_query, limit=limit)$data$id
  res <- core_articles(ids, metadata = TRUE, fulltext = FALSE,
                       citations = FALSE, similar = FALSE, urls = TRUE,
                       extractedUrls = FALSE, faithfulMetadata = FALSE,
                       method = "POST", parse = TRUE)
  df <- res$data
  df <- df[which(df$id!="NA"),]
  # rename columns
  names(df)[names(df) == "description"] <- "paper_abstract"
  names(df)[names(df) == "subjects"] <- "subject"

  # make subject a single character string, semicolon separated
  df$subject <- vapply(df$subject, function(z) paste0(z, collapse = "; "), "")
  df$authors <- vapply(df$authors, function(z) paste0(z, collapse = ", "), "")
  df$url <- unlist(lapply(df$fulltextUrls, extract_url))
  df$link <- lapply(df$fulltextUrls, get_pdf_candidates)
  df$oa_state <- unlist(lapply(df$link, get_oa_state))
  df$year <- unlist(lapply(df$datePublished, function(x){substr(x, 1, 10)}))
  df$published_in <- unlist(lapply(df$journals, get_journal))
  df$article_type <- df$subject

  subject_all = check_metadata(df$topics)
  subject_all = unlist(lapply(subject_all, function(x){paste0(x, collapse="; ")}))
  df$subject_orig = subject_all

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

  df$subject = subject_cleaned

  text = data.frame(matrix(nrow=nrow(df)))
  names(text) <- "id"
  text$id = df$id
  text$content = paste(df$title, df$paper_abstract,
                       df$subject, df$publisher, df$authors,
                       sep=" ")
  return(list(metadata = df, text = text))
}

build_query <- function(query, params) {
  core_query <- data.frame(params)
  core_query$exact_phrase <- query
  core_query$year_from <- substr(params["from"], 1, 4)
  core_query$year_to <- substr(params["to"], 1, 4)
  if (params$language != 'all') {
    core_query$language <- map_language(params$language)
  }
  valid_params <- c("all_of_the_words", "exact_phrase", "at_least_one_of_the_words",
                    "without_the_words", "find_those_words", "author", "publisher",
                    "repository", "doi", "year_from", "year_to", "language")
  core_query <- core_query[which(names(core_query) %in% valid_params)]
  return(core_query)
}

extract_url <- function(x){
  x = x[which(unlist(lapply(x, function(x){!grepl('.pdf', x)})))]
  if (length(x) <= 2) {
    return(x[2])
  } else if (grepl("http://creativecommons.org/licenses", x[2]) && length(x) >= 3) {
    return(x[3])
  } else if (!grepl("http://creativecommons.org/licenses", x[2]) && length(x) >= 2) {
    return(x[2])
  } else {
    return(x[1])
  }
}

get_pdf_candidates <- function(x){
  x = x[which(unlist(lapply(x, function(x){grepl('.pdf', x)})))]
  if (length(x) > 0) {
    return(x)
  } else (
    return(list())
  )
}

map_language <- function(lang_id) {
  core_sup <- list(
  "af"="Afrikaans",
  "ar"="Arabic",
  "bg"="Bulgarian",
  "bn"="Bengali",
  "cs"="Czech",
  "da"="Danish",
  "de"="German",
  "el"="Greek",
  "en"="English",
  "es"="Spanish",
  "et"="Estonian",
  "fa"="Persian",
  "fi"="Finnish",
  "fr"="French",
  "gu"="Gujarati",
  "he"="Hebrew",
  "hi"="Hindi",
  "hr"="Croatian",
  "hu"="Hungarian",
  "id"="Indonesian",
  "it"="Italian",
  "ja"="Japanese",
  "kn"="Kannada",
  "ko"="Korean",
  "lt"="Lithuanian",
  "lv"="Latvian",
  "mk"="Macedonian",
  "ml"="Malayalam",
  "mr"="Marathi",
  "ne"="Nepali",
  "nl"="Dutch",
  "no"="Norwegian",
  "pa"="Punjabi",
  "pl"="Polish",
  "pt"="Portuguese",
  "ro"="Romanian",
  "ru"="Russian",
  "sk"="Slovak",
  "sl"="Slovene",
  "so"="Somali",
  "sq"="Albanian",
  "sv"="Swedish",
  "sw"="Swahili",
  "ta"="Tamil",
  "te"="Telugu",
  "th"="Thai",
  "tl"="Tagalog",
  "tr"="Turkish",
  "uk"="Ukrainian",
  "ur"="Urdu",
  "vi"="Vietnamese",
  "zh-cn"="Simplified Chinese",
  "zh-tw"="Traditional Chinese")
  return(unlist(unname(core_sup[lang_id])))

get_oa_state <- function(x){
  if (length(x) > 0) {
    return(1)
  } else {
    return(2)
  }
}

get_journal <- function(x){
  if (length(x) > 0) {
    return(if (!is.na(x[1])) x[1] else "")
  } else {
    return("")
  }
}
