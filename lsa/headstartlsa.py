# -*- coding: utf-8 -*-
"""

##############################################################################
#
#  Title: Headstart-Visualization with LSA
#
#  Prerequisites: gensim, nltk
#
#  Description: This script takes a JSON-input of abstracts or texts
#               plus metadata, performs a latent semantic analysis,
#               and returns similarities between documents.
#               Those similarities can then be used in the Headstart-
#               Visualization.
#               
#               This script provides just the workflow, the heavy lifting
#               is done by the gensim-package by Radim Rehurek.
#               In the preprocessing stage, the nltk-package is used for
#               stopword-filtering and stemming.
#               
#               Use: Put this script in the same folder as the json-file,
#               and in the commandline, navigate to this folder and run
#               the script.
# 
#  Author: Christopher Kittel
#  Contact: c.kittel [at] edu.uni-graz.at
#  Date: 2014-06-05
#  Version: 0.5
#  Language: english
#  License: MIT License
#
##############################################################################
"""


import os, string

# import json 
import json 

# Import language processing tools
from gensim import corpora, models, similarities
from nltk.corpus import stopwords
from nltk.stem.snowball import EnglishStemmer as ES
from nltk.stem.snowball import GermanStemmer as GS



def preprocess_content(content, keyword, depth="document"):
    """ Performs a range of preprocessing over a list of documents.
    Removing stopword, filtering for alphabet character only,
    and stemming.
    """
    if depth is "document":
        if type(content[0]) is list:
            documents = [" ".join(text) for text in content]
        else:
            documents = content
    if depth is "paragraph":
        documents = content
    if depth is "sentence":
        documents = ["".join(text).split(". ") for text in content]

    #filter out digits and special characters
    delete_table = string.maketrans(string.ascii_lowercase,
                                    ' ' * len(string.ascii_lowercase))

    # remove common words and tokenize
    stope = stopwords.words("english")
    stopg = stopwords.words("german")

    #stoplist can be extended like this:
    stope.extend([""])
    stopg.extend([""])

    #texts are cleaned (characters only), 
    #filtered (stopwords removed) and stemmed (reduced to word stem)
    texts = [[ES().stem(str(word.encode("utf-8")).translate(None, delete_table))
                for word in document.lower().split()
                    if str(word.encode("utf-8")).translate(None, delete_table) not in stope]
                        for document in documents]

    # remove words that appear only once
    all_tokens = sum(texts, [])
    tokens_once = set(word for word in set(all_tokens)
                            if all_tokens.count(word) == 1)
    texts = [[word for word in text
                if word not in tokens_once]
                    for text in texts]

    #create dictionary and save for later use
    dictionary = corpora.Dictionary(texts)
    dictionary.save(keyword + '.dict')

    #create corpus and save for later use
    corpus = [dictionary.doc2bow(text) for text in texts]
    corpora.MmCorpus.serialize('{0}_corpus.mm'.format(keyword), corpus)

    return dictionary, corpus


def preprocess_query(query):
    """ Performs a range of preprocessing over a query string.
    Removing stopword, filtering for alphabet character only,
    and stemming.
    """
    #filter out digits and special characters
    delete_table = string.maketrans(string.ascii_lowercase,
                                    ' ' * len(string.ascii_lowercase))

    # remove common words and tokenize
    stope = stopwords.words("english")
    stopg = stopwords.words("german")

    #stoplist can be extended like this:
    stope.extend([""])
    stopg.extend([""])

    query = [ES().stem(str(word).translate(None, delete_table))
                for word in query.lower().split()
                    if str(word).translate(None, delete_table) not in stope]
    return query


def load_dictionary(keyword):
    """ Load dictionary and corpus from disk.
    """
    dictionary = corpora.Dictionary.load(keyword + ".dict")
    corpus = corpora.MmCorpus('{0}_corpus.mm'.format(keyword))
    return dictionary, corpus


def perform_headstart_analysis(keyword="headstart",
                                content=None,
                                model="lsa",
                                num_topics=10):
    """ First perform an analysis of the whole corpus via 
    the normal perform_analysis.
    Then perform a head_start_analysis with the dictionary 
    and corpus_bow preloaded.
    """

    try:
        dictionary, corpus = load_dictionary(keyword)
    except Exception, e:
        texts = [value["abstract"] for value in content.values()]
        dictionary, corpus = preprocess_content(texts, keyword)

    if model is "lsa":
        _model = create_lsi_model(dictionary, corpus, num_topics)
    if model is "lda":
        _model = create_lda_model(dictionary, corpus, num_topics)
    
    try:
        index = similarities.MatrixSimilarity.load(keyword+'.index')
    except Exception, e:
        index = similarities.MatrixSimilarity(_model[corpus])
        index.save(keyword+'.index')

    for docId, doc in content.iteritems():
        query = preprocess_query(doc["abstract"].encode("utf-8"))
        query_bow = dictionary.doc2bow(query)
        query_vec = _model[query_bow]
        sims =  index[query_vec]
        results = sorted(enumerate(sims), key=lambda item: -item[1])
        for result in results:
            if docId != result[0]:
                export_headstart_sims(docId, result[0], result[1])
        export_headstart_meta(doc["doi"], doc["title"], docId)


def create_lsi_model(dictionary, corpus_bow, num_topics):
    """ Perform an analysis with an LSI-Model.
    """
    return models.LsiModel(corpus_bow, id2word=dictionary, num_topics=num_topics)


def create_lda_model(dictionary, corpus_bow, num_topics):
    """ Perform an analysis with an LDA-Model.
    """
    return models.LdaModel(corpus_bow, id2word=dictionary, num_topics=num_topics)


def export_headstart_sims(doc1, doc2, weight):
    """ Exports the cosine-similarities into a csv.
    """

    headstart_cooc = os.path.join((os.getcwd()), "headstart_cooc.csv")

    write_results = open(headstart_cooc, "a")
    write_results.write(str(doc1+1) + "," +
                        str(doc2+1) + "," +
                        str(weight) + "\n")
    write_results.close()


def export_headstart_meta(doi, title, docId):
    """ Exports the metadata availiable into a csv.
    """

    headstart_meta = os.path.join((os.getcwd()), "headstart_meta.csv")

    write_results = open(headstart_meta, "a")
    write_results.write(str(doi.encode("utf-8")) + ";" +
                        str(title.encode("utf-8")) + ";" +
                        str(docId+1) + "\n")
    write_results.close()



def main():

    with open("result.json") as json_file:
        json_data = json.load(json_file)

    content = dict(enumerate([{"doi":doi,
                                "abstract":val["abstract"],
                                "title":val["title"]}
                                for doi, val in json_data.iteritems()]))

    perform_headstart_analysis(content=content)


if __name__ == "__main__":
    main()
