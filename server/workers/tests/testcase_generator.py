import json
import numpy as np
import datetime
from numpy.random import choice, randint
from hashlib import md5
from collections import OrderedDict

np.random.seed(42)

search_terms = [
    '"summary writing"',
     'accounting',
     'ai',
     'animals',
     'architecture',
     'artificial intelligence',
     'artikel ilmiah tentang studi kelayakan proyek pertanian',
     'big data',
     'blockchain',
     'bullying',
     'business',
     'cancer',
     'chemistry',
     'climate change',
     'communication',
     'computer science',
     'construction management',
     'corona',
     'corona virus',
     'coronavirus',
     'covid',
     'covid 19',
     'covid-19',
     'covid19',
     'customer experience',
     'data mining',
     'data science',
     'diabetes',
     'digital education',
     'digital marketing',
     'digital transformation',
     'economics',
     'education',
     'entrepreneurship',
     'faktor penyebab kejadian dermatitis kontak iritan',
     'finance',
     'fintech',
     'flipped classroom',
     'food',
     'gender',
     'happiness',
     'heart disease',
     'history',
     'ijarah',
     'information literacy',
     'journalism',
     'jurnal',
     'jurnal pemasaran',
     'kajian faktor2 yang mempengaruhi konsumsi,  manajemen perancangan menu pada institusi makanan',
     'kepemimpinan',
     'kinerja karyawan',
     'knowledge management',
     'knowledge map',
     'kompensasi',
     'komplikasi kehamilan',
     'komunikasi terapeutik keperawatan',
     'law',
     'leadership',
     'loyalitas',
     'loyalitas karyawan',
     'management',
     'marketing',
     'math',
     'mathematics',
     'mental health',
     'microbiology',
     'motivasi',
     'music',
     'natural language processing',
     'nursing',
     'osint',
     'pariwisata',
     'pembelajaran daring',
     'pembelajaran di masa pandemi',
     'pembelajaran dimasa pandemi',
     'penjualan produk',
     'physics',
     'psychology',
     'research paper',
     'science',
     'smart city',
     'social attention',
     'social media',
     'sociology',
     'stress',
     'studi kelayakan proyek',
     'studi kelayakan proyek pertanian',
     'stuff',
     'stunting',
     'sugar',
     'supply chain management',
     'technology',
     'teori kepemimpinan',
     'text mining',
     'tourism',
     'umkm',
     'virus corona',
     'work from home',
     'zakat'
 ]

pubmed_articletypes = [
  "adaptive clinical trial",
  "address",
  "autobiography",
  "bibliography",
  "biography",
  "book illustrations",
  "case reports",
  "classical article",
  "clinical conference",
  "clinical study",
  "clinical trial",
  "clinical trial protocol",
  "clinical trial, phase i",
  "clinical trial, phase ii",
  "clinical trial, phase iii",
  "clinical trial, phase iv",
  "clinical trial, veterinary",
  "collected work",
  "comment",
  "comparative study",
  "congress",
  "consensus development conference",
  "consensus development conference, nih",
  "controlled clinical trial",
  "corrected and republished article",
  "dataset",
  "dictionary",
  "directory",
  "duplicate publication",
  "editorial",
  "electronic supplementary materials",
  "english abstract",
  "ephemera",
  "equivalence trial",
  "evaluation study",
  "expression of concern",
  "festschrift",
  "government publication",
  "guideline",
  "historical article",
  "interactive tutorial",
  "interview",
  "introductory journal article",
  "journal article",
  "lecture",
  "legal case",
  "legislation",
  "letter",
  "meta analysis",
  "multicenter study",
  "news",
  "newspaper article",
  "observational study",
  "observational study, veterinary",
  "overall",
  "patient education handout",
  "periodical index",
  "personal narrative",
  "pictorial work",
  "popular work",
  "portrait",
  "practice guideline",
  "pragmatic clinical trial",
  "publication components",
  "publication formats",
  "publication type category",
  "published erratum",
  "randomized controlled trial",
  "randomized controlled trial, veterinary",
  "research support, american recovery and reinvestment act",
  "research support, n i h, extramural",
  "research support, n i h, intramural",
  "research support, non u s gov't",
  "research support, u s gov't, non p h s",
  "research support, u s gov't, p h s",
  "research support, u s government",
  "retracted publication",
  "retraction of publication",
  "review",
  "scientific integrity review",
  "study characteristics",
  "support of research",
  "systematic review",
  "technical report",
  "twin study",
  "validation study",
  "video audio media",
  "webcast"
 ]


class ParamSpace(object):

    def __init__(self):
        pass


class BaseParamSpace(ParamSpace):

    def __init__(self):
        pass

    def random_document_types(self):
        return ["121"]

    def random_timeframe(self):
        earliest = datetime.date(1665, 1, 1)
        latest = datetime.date.today()
        #days_difference = (latest - earliest).days
        #random_n_days = randint(1, days_difference)
        random_n_days = randint(1, 1095)
        random_startdate = latest - datetime.timedelta(days=random_n_days)
        return str(random_startdate), str(latest)

    def random_query(self):
        return choice(search_terms)

    def random_sorting(self):
        sorting = ["most-relevant", "most-recent"]
        distribution = [0.9, 0.1]
        return choice(sorting, 1, True, distribution)[0]

    def generate_params(self):
        params = {}
        params["document_types"] = self.random_document_types()
        params["from"], params["to"] = self.random_timeframe()
        params["q"] = self.random_query()
        params["sorting"] = self.random_sorting()
        params["service"] = "base"
        params["limit"] = 120
        params["list_size"] = 100
        params["language"] = "english"
        return params


class PubmedParamSpace(ParamSpace):

    def __init__(self):
        pass

    def random_document_types(self):
        n_articletypes = randint(1, len(pubmed_articletypes))
        return list(choice(pubmed_articletypes, n_articletypes, False))

    def random_timeframe(self):
        earliest = datetime.date(1809, 1, 1)
        latest = datetime.date.today()
        #days_difference = (latest - earliest).days
        #random_n_days = randint(1, days_difference)
        random_n_days = randint(1, 1095)
        random_startdate = latest - datetime.timedelta(days=random_n_days)
        return str(random_startdate), str(latest)

    def random_query(self):
        return choice(search_terms)

    def random_sorting(self):
        sorting = ["most-relevant", "most-recent"]
        distribution = [0.9, 0.1]
        return choice(sorting, 1, True, distribution)[0]

    def generate_params(self):
        params = {}
        params["article_types"] = self.random_document_types()
        params["from"], params["to"] = self.random_timeframe()
        params["q"] = self.random_query()
        params["sorting"] = self.random_sorting()
        params["service"] = "base"
        params["limit"] = 100
        params["list_size"] = -1
        params["language"] = "english"
        return params


def create_mapid(params):
    if params["service"] == "base":
        params_array = ["from", "to", "document_types", "sorting"]
    if params["service"] == "pubmed":
        params_array = ["from", "to", "sorting", "article_types"]
    ordered_params = OrderedDict()
    for k in params_array:
        ordered_params[k] = params[k]
    string_to_hash = json.dumps(ordered_params, separators=(',',':'))
    string_to_hash = " ".join([params["q"], string_to_hash])
    mapid = md5(string_to_hash.encode('utf-8')).hexdigest()
    return mapid

base_paramgen = BaseParamSpace()
testcases = {}
for i in range(10):
    testparams = base_paramgen.generate_params()
    testid = create_mapid(testparams)
    testcases[testid] = testparams

for caseid, params in testcases.items():
    res = {}
    res["params"] = params
    with open("testdata/%s.json" % caseid, "w") as outfile:
        json.dump(res, outfile)
