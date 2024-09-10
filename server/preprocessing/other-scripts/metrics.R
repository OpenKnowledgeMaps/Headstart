library("rAltmetric")
library("rcrossref")
library("plyr")

alog <- getLogger("metrics")


enrich_metadata_metrics <- function(metadata) {
  start.time <- Sys.time()

  results <- get_altmetrics(metadata$doi)
  requested_metrics <- c(
    "cited_by_wikipedia_count",
    "cited_by_msm_count",
    "cited_by_policies_count",
    "cited_by_patents_count",
    "cited_by_accounts_count"
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
    output <- merge(x = metadata, y = results, by = "doi", all.x = TRUE, all.y = FALSE)
  } else {
    for (metric in requested_metrics) {
      metadata[[metric]] <- NA
    }
    alog$info("No altmetrics found for any paper in this dataset.")
    output <- metadata
  }
  output <- add_citations(output)

  # Remove duplicate lines - TODO: check for root of this problem
  output <- unique(output)

  output_json <- toJSON(output)

  end.time <- Sys.time()
  time.taken <- end.time - start.time
  alog$info(paste("vis_id:", .GlobalEnv$VIS_ID, "Time taken:", time.taken, sep = " "))

  return(output_json)
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
        alog$debug(gsub("[\r\n]", "", paste(err, doi, sep = " ")))
      }
    )
  }
  return(results)
}

add_citations <- function(output) {
  dois <- output$doi
  valid_dois <- unique(dois[which(dois != "")])

  cc <- tryCatch(
    {
      cr_citation_count(doi = valid_dois, async = TRUE)
    },
    error = function(err) {
      alog$debug(gsub("[\r\n]", "", paste(err, doi, sep = " ")))
      return(list(doi = dois, count = NA))
    }
  )
  names(cc)[names(cc) == "count"] <- "citation_count"
  output <- merge(x = output, y = cc, by = "doi", all.x = TRUE)
  return(output)
}
