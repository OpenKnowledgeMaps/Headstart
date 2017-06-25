# based on https://rpubs.com/ivan_berlocher/79860
# Reference 참고: Refer to original paper:
# http://acl.ldc.upenn.edu/acl2004/emnlp/pdf/Mihalcea.pdf
# Original R code: http://snipplr.com/view/53331/textrank--keywords-extraction/

library(NLP)
library(tm)
library(openNLP)
library(igraph)

tagPOS <-  function(x, ...) {
  s <- as.String(x)
  word_token_annotator <- Maxent_Word_Token_Annotator()
  a2 <- Annotation(1L, "sentence", 1L, nchar(s))
  a2 <- annotate(s, word_token_annotator, a2)
  a3 <- annotate(s, Maxent_POS_Tag_Annotator(), a2)
  a3w <- a3[a3$type == "word"]
  POStags <- unlist(lapply(a3w$features, `[[`, "POS"))
  POStagged <- paste(sprintf("%s/%s", s[a3w], POStags), collapse = " ")
  list(POStagged = POStagged, POStags = POStags)
}

SplitText <- function(Phrase) {
  unlist(strsplit(Phrase, " "))
}
trim <- function (x) gsub("^\\s+|\\s+$", "", x)

IsPunctuated <- function(Phrase) {
  length(grep("\\.|,|!|\\?|;|:|\\)|]|}\\Z",
              Phrase, perl = TRUE)) > 0 # punctuation: . , ! ? ; : ) ] }
}

SelectTaggedWords <- function(Words, tagID) {
  Words[ grep(tagID, Words) ]
}

RemoveTags <- function(Words) {
  sub("/[A-Z]{2,3}", "", Words)
}


GetWordLinks <- function(position, scope) {
  scope <- ifelse(position + scope > length(tokens),
                  length(tokens),
                  position + scope)
  links <- ""
  for (i in (position + 1):scope) {
    if (IsSelectedWord(tokens[i])) links <- c(links, tokens[i])
  }

  if (length(links) > 1) {
    links[2:length(links)]
  }
  else {
    links <- ""
  }
  return(links)
}

constructTextGraph <- function(tokens, stops) {
  # word_graph <- graph.empty(weighted=TRUE)
  edgelist <- list()
  # source <- list()
  # target <- list()
  i <- 1
  while (i < length(tokens)) {
    word <- tokens[i]
    word2 <- tokens[i+1]
    if ((word %in% selected_tokens) && !(word %in% stops) &&
        (word2 %in% selected_tokens) && !(word2 %in% stops)) {
      # source <- append(source, word)
      # target <- append(target, tokens[i + 1])
      edgelist <- append(edgelist, word)
      edgelist <- append(edgelist, tokens[i+1])
    }
    i <- i+1
  }
  # vertices <- data.frame(name=selected_tokens)
  # relations <- data.frame(from=source, to=target)
  # word_graph <- graph.data.frame(relations, directed=TRUE, vertices=vertices, weighted=TRUE)
  el <- matrix(edgelist, ncol=2, byrow=TRUE)
  word_graph <- graph.data.frame(el)
  return(word_graph)
}


create_cluster_labels <- function(clusters, metadata_full_subjects,
                                  weightingspec, top_n,
                                  stops, taxonomy_separator = "/") {
  clusters$cluster_labels <- ""
  for (k in seq(1, clusters$num_clusters)) {
    subjectlist <- list()
    group <- c(names(clusters$groups[clusters$groups == k]))
    matches <- which(metadata_full_subjects$id %in% group)

    titles <-  metadata_full_subjects$title[c(matches)]
    abstracts <- metadata_full_subjects$paper_abstract[c(matches)]

    titles <- lapply(titles, function(x) {gsub("[^[:alnum:]]", " ", x)})
    titles <- lapply(titles, gsub, pattern = "  ", replacement = " ")
    titles <- lapply(titles, tolower)
    titles <- lapply(titles, function(x) {removeWords(x, stops)})

    all_subjects <- paste(titles, abstracts, collapse = " ")
    all_subjects <- gsub(",", ";", all_subjects)
    subjectlist <- c(subjectlist, all_subjects)

    nn_corpus <- Corpus(VectorSource(subjectlist))

    nn_corpus <- tm_map(nn_corpus, stripWhitespace)
    nn_corpus <- tm_map(nn_corpus, tolower)
    tokens_with_punctuation <<- SplitText(as.character(nn_corpus[[1]]))
    nn_corpus <- tm_map(nn_corpus, removePunctuation)

    tokens <<- SplitText(as.character(nn_corpus[[1]]))
    tagged_text <- tagPOS(nn_corpus[[1]])
    tagged_tokens <- SplitText(as.character(tagged_text))
    tagged_tokens <- c(SelectTaggedWords(tagged_tokens, "/NN"),
                      SelectTaggedWords(tagged_tokens, "/JJ"))
                      # keep only NN & JJ tagged tokens
    tagged_tokens <- RemoveTags(tagged_tokens)  # remove un-used tag POS
    selected_tokens <<- unique(tagged_tokens)
    text_graph <- constructTextGraph(tokens, stops)

    nodes_rank <- page_rank(text_graph)$vector
    lws <- identify_labels(nodes_rank)
    labels <- unlist(lws$labels)
    labels_scores = unlist(lws$labels_scores)

    labels_df <- data.frame(labels, labels_scores)
    labels_list <- labels_df[order(labels_df$labels_scores,
                                       decreasing = TRUE), ]
    labels_list <- labels_list[!duplicated(labels_list), ]
    cluster_label <- labels_list$labels[1:3]
    clusters$cluster_labels[c(matches)] <- paste(cluster_label, collapse = ", ")
  }
  return(clusters)
}

identify_labels <- function(nodes_rank, max_ngram = 3) {
  nodes_num <- length(nodes_rank)
  labels_num <- round(nodes_num / 3) # a third of the number of vertices in the graph.
  textrank_top <- sort(nodes_rank, TRUE)[1:labels_num]
  textrank_topwords <- names(textrank_top)
  labels <- list()
  labels_scores <- list()
  for (i in 1:labels_num) {
    keyword_positions <- which(tokens == textrank_topwords[i])
    for (j in 1:length(keyword_positions)) {
      keyword <- list()
      keyword_score <- 0
      k <- keyword_positions[j]
      repeat {
        if (length(keyword) >= max_ngram) break
        if (tokens[k] %in% selected_tokens) {
          keyword <- c(keyword, tokens[k])
          keyword_score <- keyword_score + unname(nodes_rank[
                                             which(
                                               names(nodes_rank) == tokens[k])])
        }
        else break
        if (IsPunctuated(tokens_with_punctuation[k])) break
        if (k == length(tokens)) break
        k <- k + 1
      }
      k <- keyword_positions[j] - 1
      repeat {
        if (length(keyword) >= max_ngram) break
        if (k < 1) break
        if (tokens[k] %in% selected_tokens) {
          keyword <- c(tokens[k], keyword)
          keyword_score <- keyword_score + unname(nodes_rank[
                                             which(
                                               names(nodes_rank) == tokens[k])])
        }
        else break
        if (k > 1) {
          if (IsPunctuated(tokens_with_punctuation[k - 1])) break
          }
        k <- k - 1
      }
      if ((keyword != textrank_topwords[i]) &&
          (length(keyword_score) > 0)) {
        keyword <- paste(keyword, collapse = " ")
        keyword <- paste0(
                     toupper(
                       substr(keyword, 1, 1)),
                     substr(keyword, 2, nchar(keyword)))
        labels <- append(labels, keyword)
        labels_scores <- append(labels_scores, keyword_score)
      }
    }
  }
  return(list(labels = labels,
              labels_scores = labels_scores))
}
