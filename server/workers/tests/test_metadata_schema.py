import json
import pandas as pd
import pytest

from .test_helpers import CASENAMES, CASEDATA, RESULTS, TRIPLE, retrieve_results

from pandas_schema import Column, Schema
from pandas_schema.validation import (InListValidation,
                                      DateFormatValidation,
                                      IsDtypeValidation,
                                      CustomElementValidation)


core_schema = Schema([
    Column('id', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('authors', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('title', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('paper_abstract', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('year', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('subject_orig', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
])


base_schema = Schema([
    Column('link', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('oa_state', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('published_in', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('subject', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('url', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('relation', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('relevance', [CustomElementValidation(
                    lambda x: isinstance(x, int), "Not an integer.")])
])


pubmed_schema = Schema([
    Column('subject', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('url', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('doi', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('pmid', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
])


knowledgemap_schema = Schema([
    Column('id', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('relation', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('identifier', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('title', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('paper_abstract', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('published_in', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('year', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('subject_orig', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('subject', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('authors', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('link', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('oa_state', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('url', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('relevance', [CustomElementValidation(
                    lambda x: isinstance(x, int), "Not an integer.")]),
    Column('cluster_labels', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('x', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('y', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('area_uri', [CustomElementValidation(
                    lambda x: isinstance(x, int), "Not an integer.")]),
    Column('area', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
])


def report_validation_error(error):
    return "%s %s" % (error.column, error.message)


@pytest.mark.parametrize("testcase", CASENAMES)
def test_metadata_schema(testcase):
    testcase = CASEDATA[testcase]
    service = testcase["params"]["service"]
    metadata = pd.DataFrame.from_records(json.loads(testcase["input_data"]["metadata"]))
    core_errors = core_schema.validate(
                            metadata, columns=core_schema.get_column_names())
    if service == "base":
        service_errors = base_schema.validate(
                            metadata, columns=base_schema.get_column_names())
    if service == "pubmed":
        service_errors = pubmed_schema.validate(
                            metadata, columns=pubmed_schema.get_column_names())
    assert len(core_errors) == 0, "\n".join([report_validation_error(e)
                                             for e in core_errors])
    assert len(service_errors) == 0, "\n".join([report_validation_error(e)
                                                for e in service_errors])


@pytest.mark.parametrize("testcase", CASENAMES)
def test_knowledgemap_schema(testcase):
    testcase = RESULTS[testcase]
    errors = knowledgemap_schema.validate(
                        testcase, columns=knowledgemap_schema.get_column_names())
    assert len(errors) == 0, "\n".join([report_validation_error(e)
                                             for e in errors])


@pytest.mark.parametrize("testcase", TRIPLE)
def test_metadata_schema_triple(testcase):
    testcase = retrieve_results(testcase)
    errors = knowledgemap_schema.validate(
                        testcase, columns=knowledgemap_schema.get_column_names())
    assert len(errors) == 0, "\n".join([report_validation_error(e)
                                             for e in errors])