import os
import sys
import re
import json
from itertools import chain
from elasticsearch import Elasticsearch, NotFoundError
from elasticsearch_dsl import Search, Q
import pandas as pd
import logging

import spacy
from spacy_cld import LanguageDetector


formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')
valid_langs = ['en', 'es', 'fr']


class TripleClient(object):

    def __init__(self, config, redis_store,
                 loglevel="INFO"):
        self.es = Elasticsearch(
            [config.get('host')],
            http_auth=(config.get('user'), config.get('pass')),
            scheme="http" if config.get('host') == 'localhost' else "https",
            port=config.get('port'),
            send_get_body_as='POST',
            http_compress=True,
            retry_on_timeout=True
        )
        self.redis_store = redis_store
        self.nlp = spacy.load("xx_ent_wiki_sm")
        self.nlp.add_pipe(LanguageDetector())
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(loglevel)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        handler.setLevel(loglevel)
        self.logger.addHandler(handler)

    def next_item(self):
        queue, msg = self.redis_store.blpop("triple")
        msg = json.loads(msg)
        k = msg.get('id')
        parameters = msg.get('params')
        parameters["service"] = "triple"
        endpoint = msg.get('endpoint')
        return k, parameters, endpoint

    def get_mappings(self, index):
        return self.es.indices.get_mapping(index)

    def build_date_field(self, _from, _to):
        date = {}
        date["gte"] = _from
        date["lte"] = _to
        date["format"] = "yyyy-MM-dd"
        return date

    def build_sort_order(self, parameters):
        sort = []
        if parameters.get('sorting') == "most-relevant":
            sort.append("_score:desc")
        if parameters.get('sorting') == "most-recent":
            sort.append("date:desc")
        return sort

    def get_limit(self, parameters):
        limit = parameters.get('limit', 100)
        if isinstance(limit, str):
            limit = int(limit)
        return limit

    @staticmethod
    def parse_query(query, fields):
        if '"' in query:
            q = Q("multi_match", query=query, fields=fields, type="phrase")
        else:
            should = [Q("multi_match", query=qt, fields=fields, type="best_fields") for qt in query.split(" ")]
            q = Q('bool', should=should)
        return q

    def search_documents(self, parameters):
        index = os.getenv("TRIPLE_DOCUMENTS_INDEX")
        fields = ["headline.text", "abstract.text"]
        s = Search(using=self.es, index=index)
        # TODO: replace from parameters
        q = self.parse_query(parameters.get('q'), fields)
        s = s.query(q)
        lang = parameters.get('language')
        if lang != 'all' and lang in valid_langs:
            s = s.filter("match", abstract__lang=lang)
        s = s.query("range", date_published=self.build_date_field(
                    parameters.get('from'),
                    parameters.get('to')))
        #s = s[parameters.get('pagination_from'):parameters.get('pagination_to')]
        s = s[0:self.get_limit(parameters)*2]
        self.logger.debug(s.to_dict())
        result = s.execute()
        if parameters.get('raw') is True:
            return result.to_dict()
        else:
            return self.process_documents(result, parameters)

    def process_documents(self, result, parameters):
        """
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
        """
        lang = parameters.get('language')
        subject_fields = os.getenv("SUBJECT_FIELDS").split(",")
        df = pd.DataFrame((d.to_dict() for d in result))
        if parameters["sorting"] == "most-recent":
            df = df.sort_values("date_published", ascending=0)
        metadata = pd.DataFrame()
        metadata["id"] = df.id.map(lambda x: x if isinstance(x, str) else "")
        metadata["title"] = df.headline.map(lambda x: self.filter_lang(x, lang, "text"))
        metadata["title_en"] = df.headline.map(lambda x: self.filter_lang(x, 'en', "text"))
        metadata["authors"] = df.author.map(lambda x: self.get_authors(x) if isinstance(x, list) else "")
        metadata["paper_abstract"] = df.abstract.map(lambda x: self.filter_lang(x, lang, "text"))
        metadata["paper_abstract_en"] = df.abstract.map(lambda x: self.filter_lang(x, 'en', "text"))
        metadata["published_in"] = df.publisher.map(lambda x: ", ".join(x))
        metadata["year"] = pd.to_datetime(df.date_published, errors='coerce').map(lambda x: x.year)
        metadata["url"] = df.main_entity_of_page.map(lambda x: x if x else "")
        metadata["readers"] = 0
        metadata["subject_orig"] = (df.keywords
                .map(lambda x: [i.get('text') for i in x if i.get('text')] if isinstance(x, list) else [])
                .map(lambda x: "; ".join(x)))
        metadata["subject"] = (df.keywords
                .map(lambda x: [i.get('text') for i in x if i.get('text')] if isinstance(x, list) else [])
                .map(lambda x: [self.clean_subject(s) for s in x if s])
                .map(lambda x: list(filter(lambda l: len(l) > 0, x)))
                .map(lambda x: "; ".join(x)))
        metadata["concepts"] = df.knows_about.map(lambda x: "; ".join(sorted(filter(None, set([self.filter_lang(y["label"], lang, "text") for y in x])))).replace(". ", "; "))
        metadata["concepts_en"] = df.knows_about.map(lambda x: "; ".join(sorted(filter(None, set([self.filter_lang(y["label"], 'en', "text") for y in x])))).replace(". ", "; "))
        metadata["oa_state"] = 2
        metadata["link"] = (df.url.map(lambda x: list(filter(lambda l: l.lower().endswith('pdf'), x)))
                              .map(lambda x: x[0] if x else ""))
        metadata["relevance"] = df.index
        metadata.dropna(axis=0, subset=["year"], inplace=True)
        metadata["subject"] = metadata.apply(lambda x: ". ".join(x[subject_fields]), axis=1)
        metadata = metadata.head(parameters.get('limit'))
        text = pd.DataFrame()
        text["id"] = metadata["id"]
        text["content"] = metadata.apply(lambda x: ". ".join(x[["title_en", "paper_abstract_en", "concepts_en"]]), axis=1)        
        input_data = {}
        input_data["metadata"] = metadata.to_json(orient='records')
        input_data["text"] = text.to_json(orient='records')
        return input_data

    @staticmethod
    def clean_string(string):
        return ''.join(x for x in string if x.isprintable())

    @staticmethod
    def filter_lang(field, lang, content_field):
        if lang == 'all':
            lang = 'en'
        filtered = [d.get(content_field)
                    for d in field
                    if (d.get('lang', '') == lang)]
        if len(filtered) == 0:
            filtered = [d.get(content_field)
                        for d in field
                        if (d.get('lang', '') == 'en')]
        if len(filtered) == 0:
            try:
                if filtered == []:
                    filtered.append(field[0].get(content_field))
            except Exception:
                filtered = [""]
        return ". ".join(filtered)

    @staticmethod
    def clean_subject(subject):
        subject_cleaned = re.sub(r"DOAJ:[^;]*(;|$)?", "", subject) # remove DOAJ classification
        subject_cleaned = re.sub(r"/dk/atira[^;]*(;|$)?", "", subject_cleaned) # remove atira classification
        subject_cleaned = re.sub(r"ddc:[0-9]+(;|$)?", "", subject_cleaned) # remove Dewey Decimal Classification
        subject_cleaned = re.sub(r"([\w\/\:-])*?\/ddc\/([\/0-9\.])*", "", subject_cleaned) # remove Dewey Decimal Classification in URI form
        subject_cleaned = re.sub(r"[A-Z,0-9]{2,}-[A-Z,0-9\.]{2,}(;|$)?", "", subject_cleaned) #remove LOC classification
        subject_cleaned = re.sub(r"bisacsh\:\w+", "", subject_cleaned) # remove bisac subject headings
        subject_cleaned = re.sub(r"[A-Z]+\d+", "", subject_cleaned) #remove remaining bisac subject headings
        subject_cleaned = re.sub(r"JEL\: ", "", subject_cleaned) #remove JEL classifications
        subject_cleaned = re.sub(r"[^\(;]+\(General\)(;|$)?", "", subject_cleaned) # remove general subjects
        subject_cleaned = re.sub(r"[^\(;]+\(all\)(;|$)?", "", subject_cleaned) # remove general subjects
        subject_cleaned = re.sub(r"[^:;]+ ?:: ?[^;]+(;|$)?", "", subject_cleaned) #remove classification with separator ::
        subject_cleaned = re.sub(r"[^\[;]+\[[A-Z,0-9]+\](;|$)?", "", subject_cleaned) # remove WHO classification
        subject_cleaned = re.sub(r"</keyword><keyword>", "", subject_cleaned) # remove </keyword><keyword>
        subject_cleaned = re.sub(r"\[[^\[]+\][^\;]+(;|$)?", "", subject_cleaned) # remove classification
        subject_cleaned = re.sub(r"[0-9]{2,} [A-Z]+[^;]*(;|$)?", "", subject_cleaned) #remove classification
        subject_cleaned = re.sub(r" -- ", "; ", subject_cleaned) #replace inconsistent keyword separation
        subject_cleaned = re.sub(r" ?• ?", "; ", subject_cleaned) #replace inconsistent keyword separation
        subject_cleaned = re.sub(r" \(  ", "; ", subject_cleaned) #replace inconsistent keyword separation
        subject_cleaned = re.sub(r"(\w* \w*(\.)( \w* \w*)?)", "; ", subject_cleaned) # remove overly broad keywords separated by .
        subject_cleaned = re.sub(r"\. ", "; ", subject_cleaned) # replace inconsistent keyword separation
        subject_cleaned = re.sub(r" ?\d[:?-?]?(\d+.)+", "", subject_cleaned) # replace residuals like 5:621.313.323 or '5-76.95'
        subject_cleaned = re.sub(r"\w+:\w+-(\w+\/)+", "", subject_cleaned) # replace residuals like Info:eu-repo/classification/
        subject_cleaned = re.sub(r"\[\w+\.?\w+\]", "", subject_cleaned) # replace residuals like [shs.hisphilso]
        subject_cleaned = re.sub(r"; ?$", "", subject_cleaned) # remove trailing '; '
        return subject_cleaned

    @staticmethod
    def get_subjects(subjectlist):
        return "; ".join(chain.from_iterable([s.get('label', []) for s in subjectlist]))

    @staticmethod
    def get_authors(authorlist):
        authors = []
        for a in authorlist:
            if a:
                author = []
                for n in ['family_name', 'given_name']:
                    if a.get(n, [None])[0]:
                        author.append(a.get(n)[0])
                authors.append(", ".join(author))
        return "; ".join(authors)

    def run(self):
        while True:
            k, parameters, endpoint = self.next_item()
            self.logger.debug(parameters)
            if endpoint == "mappings":
                res = self.get_mappings(parameters.get('index'))
                self.redis_store.set(k+"_output", json.dumps(res))
            if endpoint == "search":
                try:
                    res = {}
                    res["id"] = k
                    res["input_data"] = self.search_documents(parameters)
                    res["params"] = parameters
                    res["status"] = "success"
                    if parameters.get('raw') is True:
                        self.redis_store.set(k+"_output", json.dumps(res))
                    else:
                        self.redis_store.rpush("input_data", json.dumps(res))
                except (NotFoundError, Exception) as e:
                    self.logger.exception("Exception during data retrieval.")
                    res = {}
                    res["id"] = k
                    res["params"] = parameters
                    res["status"] = "error"
                    res["error"] = str(e)
                    self.redis_store.set(k+"_output", json.dumps(res))