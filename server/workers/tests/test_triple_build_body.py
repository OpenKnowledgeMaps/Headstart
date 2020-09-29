import workers
from workers.triple.src.search_triple import TripleClient
import json
import pytest


# @pytest.fixture
# def triple_client():
#     return TripleClient({
#                         "host": "localhost",
#                         "user": "",
#                         "pass": "",
#                         "port": 9200})
#
#
# def test_query_parsing(triple_client):
#     queries = {'2019-ncov and sars-cov-2': {'bool': {'must': [{'multi_match': {'title': '2019-ncov',
#                                                       'fields': ['title', 'abstract']}},
#                                                     {'multi_match': {'title': 'sars-cov-2',
#                                                       'fields': ['title', 'abstract']}}]}},
#                'term1 term2 term3': {'bool': {'should': [{'multi_match': {'title': 'term1',
#                                           'fields': ['title', 'abstract']}},
#                                         {'multi_match': {'title': 'term2', 'fields': ['title', 'abstract']}},
#                                         {'multi_match': {'title': 'term3', 'fields': ['title', 'abstract']}}]}}
#                # '(dog and cat) or (sun and moon)': '(textus:dog and textus:cat) or (textus:sun and textus:moon)',
#                # 'cats and "mice and cheese"': 'textus:cats and textus:"mice and cheese"',
#                # 'cats or (sun and moon)': 'textus:cats or (textus:sun and textus:moon)',
#                # '(parentheses or ("cats and dogs"))': '(textus:parentheses or (textus:"cats and dogs"))',
#                # '-2019-ncov': '-textus:2019-ncov',
#                # '--2019-ncov': '-textus:2019-ncov',
#                # '(a and b -"c")': '(textus:a and textus:b -textus:"c")',
#                # '2019-ncov or sars-cov-2': 'textus:2019-ncov or textus:sars-cov-2',
#                # '"2019-ncov" or "sars-cov-2"': 'textus:"2019-ncov" or textus:"sars-cov-2"',
#                # '"2019-ncov"+"sars-cov-2"': 'textus:"2019-ncov" textus:"sars-cov-2"',
#                # '"2019-ncov" + "sars-cov-2"': 'textus:"2019-ncov" textus:"sars-cov-2"',
#                # '"2019-ncov"+"sars-cov-2"': 'textus:"2019-ncov" textus:"sars-cov-2"',
#                # '(cats + dogs) or (sun - moon)': '(textus:cats textus:dogs) or (textus:sun -textus:moon)',
#                # 'science -(research or knowledge or theory)': 'textus:science -(textus:research or textus:knowledge or textus:theory)',
#                # 'orandor or andorand': 'textus:orandor or textus:andorand',
#                # 'science -research -knowledge -theory': 'textus:science -textus:research -textus:knowledge -textus:theory',
#                # 'a+b': 'textus:a textus:b',
#                # 'and or not': 'and or textus:not',
#                # '-(dogs+cats)': '-(textus:dogs textus:cats)',
#                # '((cats) and dogs)': '((textus:cats) and textus:dogs)',
#                # '""knowledge -   and +domain visualization""': 'textus:""knowledge -   and +domain visualization""',
#                # '((-""hello"") or test)': '((-textus:""hello"") or textus:test)',
#                # 'cats - dogs': 'textus:cats -textus:dogs',
#                # 'cats --- dogs': 'textus:cats -textus:dogs',
#                # 'cats +++ dogs': 'textus:cats textus:dogs',
#                # '\'\'test\'\'': "textus: ''test''",
#                # '+++++++++++++++science': 'textus:science',
#                # '+a -b': 'textus:a -textus:b',
#                # 'sars-cov-5 or 2019-ncov and sars-cov-2 && sars-cov-3 or sars-cov-4 + sars-cov-6'
#                }
#     for q, expected in queries.items():
#         fields = ["title", "abstract"]
#         assert triple_client.parse_query(q, fields) == expected
