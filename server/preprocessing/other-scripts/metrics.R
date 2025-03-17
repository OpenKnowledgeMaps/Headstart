library("rAltmetric")
library("rcrossref")
library("plyr")

mlog <- getLogger("metrics")


enrich_metadata_metrics <- function(metadata, metrics_sources=c("altmetric", "crossref")) {
  start.time <- Sys.time()

  if ("altmetric" %in% metrics_sources) {
    metadata <- add_altmetrics(metadata)
  }
  if ("crossref" %in% metrics_sources) {
    metadata <- add_citations(metadata)
  }

  # Remove duplicate lines - TODO: check for root of this problem
  metadata <- unique(metadata)

  end.time <- Sys.time()
  time.taken <- end.time - start.time
  mlog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Time taken:", time.taken, sep = " "))

  return(metadata)
}

get_altmetrics <- function(dois) {
  valid_dois <- unique(dois[which(dois != "")])
  results <- data.frame()
  for (doi in valid_dois) {
    tryCatch(
      {
        metrics <- altmetric_data(altmetrics(doi = doi, apikey = ""))
        results <- rbind.fill(results, metrics)
      },
      error = function(err) {
        mlog$debug(gsub("[\r\n]", "", paste(err, doi, sep = " ")))
      }
    )
  }
  return(results)
}

add_altmetrics <- function(metadata) {

  results <- get_altmetrics(metadata$doi)
  requested_metrics <- c(
    "cited_by_wikipedia_count",
    "cited_by_msm_count",
    "cited_by_policies_count",
    "cited_by_patents_count",
    "cited_by_accounts_count",
    "cited_by_fbwalls_count",
    "cited_by_feeds_count",
    "cited_by_gplus_count",
    "cited_by_rdts_count",
    "cited_by_qna_count",
    "cited_by_tweeters_count",
    "cited_by_videos_count"
  )

  if (nrow(results) > 0) {
    for (metric in requested_metrics) {
      if (!(metric %in% names(results))) {
        results[[metric]] <- NA
      }
    }
    requested_metrics <- c("doi", requested_metrics)
    results <- results[requested_metrics]
    # only add the metrics that are requested where the DOI exists
    # merge the metadata with the results of the altmetrics
    # don't remove any rows from the metadata, just add the altmetrics to the
    # output
    result <- merge(x = metadata, y = results, by = "doi", all.x = TRUE, all.y = FALSE)
  } else {
    for (metric in requested_metrics) {
      metadata[[metric]] <- NA
    }
    mlog$info("No altmetrics found for any paper in this dataset.")
    result <- metadata
  }
  return(result)
}

add_citations <- function(metadata) {
  dois <- metadata$doi
  valid_dois <- unique(dois[which(dois != "")])

  cc <- tryCatch(
    {
      cr_citation_count(doi = valid_dois, async = TRUE)
    },
    error = function(err) {
      mlog$debug(gsub("[\r\n]", "", paste(err, doi, sep = " ")))
      return(list(doi = dois, count = NA))
    }
  )
  names(cc)[names(cc) == "count"] <- "citation_count"
  result <- merge(x = metadata, y = cc, by = "doi", all.x = TRUE)
  return(result)
}
