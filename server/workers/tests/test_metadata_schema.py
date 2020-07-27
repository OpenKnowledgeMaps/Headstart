import pandas as pd
import numpy as np
from pandas_schema import Column, Schema
from pandas_schema.validation import (InListValidation,
                                      DateFormatValidation,
                                      IsDtypeValidation,
                                      CustomElementValidation)


schema = Schema([
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
    Column('oa_state', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('subject_orig', [CustomElementValidation(
                    lambda x: isinstance(x, str), "Not a string.")]),
    Column('relevance', [CustomElementValidation(
                    lambda x: isinstance(x, int), "Not a string.")])
])
