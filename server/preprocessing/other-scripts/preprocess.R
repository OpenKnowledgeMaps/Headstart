library(stringi)
library(dplyr)
vplog <- getLogger('vis.preprocess')


sanitize_abstract <- function(metadata) {
  metadata$paper_abstract <- unlist(lapply(metadata$paper_abstract,
                              function(x) {
                                if (!is.na(x) && nchar(x) > 17000) {
                                  x <- substr(x, 0, 17000)
                                  x <- paste(x, "[...]")
                                } else {
                                  x
                                }
                              }))
  return(metadata)
}

filter_duplicates <- function(metadata, text, list_size) {
  #If list_size is greater than -1 and smaller than the actual list size, deduplicate titles
  if(list_size > -1) {
    dt = deduplicate_titles(metadata, list_size)
    duplicate_candidates = dt$duplicate_candidates
    text = subset(text, !(id %in% duplicate_candidates))
    metadata = subset(metadata, !(id %in% duplicate_candidates))

    text = head(text, list_size)
    metadata = head(metadata, list_size)
  }
  return(list(metadata=metadata, text=text))
}

mark_duplicates <- function(metadata) {
  #If list_size is greater than -1 and smaller than the actual list size, deduplicate titles
  dt = deduplicate_titles(metadata, 0)
  duplicate_candidates = dt$duplicate_candidates
  metadata$is_duplicate <- metadata$id %in% duplicate_candidates
  metadata <- inner_join(metadata, dt$identified_duplicates, by="id")
  return(metadata)
}

rearrange_authornames <- function(authors) {
  authorlist <- unlist(strsplit(authors, "; "))
  rearranged <- lapply(authorlist, function(author) {
    tmp <- strsplit(author, ", ")
    if (length(tmp[[1]]) == 2) {
      tmp <- paste(tmp[[1]][2], tmp[[1]][1], sep=" ")
    } else {
      tmp <- author
    }
    stringi::stri_trim(tmp)
  })
  paste(rearranged, collapse="; ")
}

deduplicate_titles <- function(metadata, list_size) {
  duplicate_candidates <- c()

  metadata$oa_state[metadata$oa_state == "2"] <- 0
  metadata = metadata[order(-as.numeric(metadata$oa_state),-stri_length(metadata$subject),
                      -stri_length(metadata$paper_abstract),-stri_length(metadata$authors),
                      -stri_length(metadata$published_in)),]

  index = (grepl(" ", metadata$title) == FALSE | stri_length(metadata$title) < 15)
  author_candidates <- unlist(lapply(metadata$authors, rearrange_authornames))
  metadata$title[index] <- paste(metadata$title[index], author_candidates[index], sep=" ")

  num_items = length(metadata$id)
  max_replacements = ifelse(num_items > list_size, num_items - list_size, -1)

  ids = metadata$id
  titles = metadata$title
  titles = unlist(lapply(titles, tolower))
  count = 1


  lv_matrix = stringdistmatrix(titles, method="lv")
  length_matrix <- stri_length(titles)
  n = length(length_matrix)
  str_matrix = matrix(length_matrix, n, n)
  str_matrix_t <- t(str_matrix)
  str_max_matrix = pmax(str_matrix, str_matrix_t)
  lv_ratio_matrix = as.matrix(lv_matrix)/str_max_matrix

  duplicates <- lv_ratio_matrix < 1/15.83
  strict_duplicates <- lv_ratio_matrix < 0.03
  tmp <- strict_duplicates
  diag(tmp) <- FALSE
  tmp <- apply(tmp, 2, function(x) ids[which(x)])
  tmp[lengths(tmp) == 0] <- ""
  if(!(identical(tmp, character(0)))) {
    identified_duplicates <- as.data.frame(do.call(rbind, lapply(tmp, paste, collapse=",")))
    identified_duplicates$id <- ids
    names(identified_duplicates) <- c("duplicates", "id")
    identified_duplicates<- identified_duplicates[!duplicated(identified_duplicates),]
    duplicates[lower.tri(duplicates, diag=TRUE)] <- NA
    remove_ids <- which(apply(duplicates, 2, FUN=function(x){any(x)}))
    duplicate_candidates = ids[remove_ids]
  } else {
    identified_duplicates <- data.frame(id=ids, duplicates="")
  }

  vplog$info(paste("Number of max. duplicate entries:", length(duplicate_candidates)))

  if(max_replacements > -1) {
    duplicate_candidates = head(duplicate_candidates, max_replacements)
  }

  vplog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Number of duplicate entries:", length(duplicate_candidates)))

  return(list("duplicate_candidates"=duplicate_candidates, "identified_duplicates"=identified_duplicates))

}

replace_keywords_if_empty <- function(metadata, stops) {
  metadata$subject <- unlist(lapply(metadata$subject, function(x) {gsub(" +", " ", x)}))
  missing_subjects = which(lapply(metadata$subject, function(x) {nchar(x)}) <= 1)
  if (length(missing_subjects) == 0) {
    return(metadata)
  }
  vplog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Documents without subjects:", length(missing_subjects)))
  candidates = mapply(paste, metadata$title)
  batch_size <- 1000
  total_length <- length(stops)
  for (i in seq(1, total_length, batch_size)) {
    candidates = mclapply(candidates, function(x)paste(removeWords(x, stops[i:min(i+batch_size -1, total_length)]), collapse=""))  
  }  
  candidates = lapply(candidates, function(x) {gsub("[^[:alpha:]]", " ", x)})
  candidates = lapply(candidates, function(x) {gsub(" +", " ", x)})
  candidates_bigrams = lapply(lapply(candidates, expand_ngrams, n=2), paste, collapse=" ")
  candidates = mapply(paste, candidates, candidates_bigrams)

  nn_corpus = Corpus(VectorSource(candidates))
  nn_tfidf = TermDocumentMatrix(nn_corpus)
  tfidf_top = apply(nn_tfidf, 2, function(x) {x2 <- sort(x, TRUE);x2[x2>=x2[3]]})
  tfidf_top_names = lapply(tfidf_top, names)
  replacement_keywords <- mclapply(tfidf_top_names, function(x) filter_out_nested_ngrams(x, 3))
  replacement_keywords = lapply(replacement_keywords, FUN = function(x) {paste(unlist(x), collapse="; ")})
  replacement_keywords = gsub("_", " ", replacement_keywords)

  metadata$subject[missing_subjects] <- replacement_keywords[missing_subjects]
  missing_subjects = which(lapply(metadata$subject, function(x) {nchar(x)}) <= 1)
  vplog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Documents without subjects after replacing from title:", length(missing_subjects)))
  if (length(missing_subjects) > 0) {
    foreach (i = missing_subjects) %dopar% {
      if (nrow(metadata) == 1) {
        candidates = mapply(paste, metadata$title, metadata$paper_abstract)
      } else {
        candidates = mapply(paste, metadata$title[i,], metadata$paper_abstract[i,])
      }
      for (i in seq(1, total_length, batch_size)) {
        candidates = mclapply(candidates, function(x)paste(removeWords(x, stops[i:min(i+batch_size -1, total_length)]), collapse=""))
      }
      candidates = lapply(candidates, function(x) {gsub("[^[:alpha:]]", " ", x)})
      candidates = lapply(candidates, function(x) {gsub(" +", " ", x)})
      candidates_bigrams = lapply(lapply(candidates, expand_ngrams, n=2), paste, collapse=" ")
      candidates = mapply(paste, candidates, candidates_bigrams)
      nn_count = sort(table(strsplit(candidates, " ")), decreasing = T)
      replacement_keywords <- filter_out_nested_ngrams(names(nn_count), 3)
      replacement_keywords = lapply(replacement_keywords, FUN = function(x) {paste(unlist(x), collapse="; ")})
      replacement_keywords = gsub("_", " ", replacement_keywords)
      if (nrow(metadata) == 1) {
        metadata$subject <- paste(replacement_keywords, collapse="; ")
      } else {
        metadata$subject[i] <- paste(replacement_keywords, collapse="; ")
      }
    }
  }
  return(metadata)
}

get_OHE_feature <-function(metadata, feature_name) {
  ohe_encoder <- onehot(metadata[feature_name], stringsAsFactors = TRUE, max_levels = 100)
  ohe_feat <- data.frame(predict(ohe_encoder, metadata[feature_name]))
  rownames(ohe_feat) <- metadata$id
  return(ohe_feat)
}
