import json
import numpy as np
import pandas as pd
import pytest
from parsers import (
    parse_crossref,
    parse_ftccsdartic,
    parse_ftdoajarticles,
    parse_ftzenodo,
    improved_df_parsing,
)

# -----------------------
# Tests for parse_crossref
# -----------------------

def test_parse_crossref_full():
    # Input with all parts: source, volume, issue, page and ISSN.
    input_str = "Test Journal ; volume 12, issue 3, page 45-50 ; ISSN 1234-567X"
    result = parse_crossref(input_str)
    assert result["published_in"] == input_str
    # Expect the source to be captured as everything before the first " ;"
    assert result["source"] == "Test Journal"
    # Check volume, issue and page from the matching groups
    assert result["volume"] == "12"
    assert result["issue"] == "3"
    assert result["page"] == "45-50"
    assert result["issn"] == "1234-567X"

def test_parse_crossref_minimal():
    # Input with only a source (no extra parts)
    input_str = "Simple Journal"
    result = parse_crossref(input_str)
    assert result["published_in"] == input_str
    assert result["source"] == "Simple Journal"
    assert np.isnan(result["volume"])
    assert np.isnan(result["issue"])
    assert np.isnan(result["page"])
    assert np.isnan(result["issn"])

# -----------------------
# Tests for parse_ftccsdartic
# -----------------------

def test_parse_ftccsdartic_unparsable():
    # For an input that doesn't match the expected ftccsdartic pattern,
    # the function should return default values (np.nan) for all parsed fields.
    input_str = "Unparsable string for ftccsdartic"
    result = parse_ftccsdartic(input_str)
    assert result["published_in"] == input_str
    assert np.isnan(result["source"])
    assert np.isnan(result["volume"])
    assert np.isnan(result["issue"])
    assert np.isnan(result["page"])
    assert np.isnan(result["issn"])

def test_parse_ftccsdartic_partial():
    # (Optional) If you have an example that does match the pattern,
    # you could test that specific case.
    # Here we provide an invented example; adjust the expected values if needed.
    input_str = "ISSN: 1234-567X ; ISSN: 2345-6789 ; Test Journal, 2020, 15 (2), pp. e123"
    result = parse_ftccsdartic(input_str)
    # We at least expect the original string to be returned in "published_in"
    assert result["published_in"] == input_str
    # And at least one of the parsed fields should not be NaN.
    # (Exact expected values depend on the regex behavior.)
    assert not (np.isnan(result["source"]) and np.isnan(result["volume"]) and np.isnan(result["issue"]) and np.isnan(result["page"]))

# -----------------------
# Tests for parse_ftdoajarticles
# -----------------------

def test_parse_ftdoajarticles():
    input_str = "Journal of Testing, Vol 10, Iss 2, Pp e123 (2020)"
    result = parse_ftdoajarticles(input_str)
    assert result["published_in"] == input_str
    # Expect group(1) to capture the source; strip in case of extra whitespace.
    assert result["source"].strip() == "Journal of Testing"
    assert result["volume"] == "10"
    assert result["issue"] == "2"
    assert result["page"] == "123"
    assert np.isnan(result["issn"])

# -----------------------
# Tests for parse_ftzenodo
# -----------------------

def test_parse_ftzenodo():
    input_str = "ZenodoRepo 42 (3) 10-20"
    result = parse_ftzenodo(input_str)
    assert result["published_in"] == input_str
    assert result["source"] == "ZenodoRepo"
    assert result["volume"] == "42"
    assert result["issue"] == "3"
    assert result["page"] == "10-20"
    assert np.isnan(result["issn"])

# -----------------------
# Test for improved_df_parsing
# -----------------------

def test_improved_df_parsing():
    # Create a DataFrame with four rows, each representing a different repository.
    data = {
        "published_in": [
            "Test Journal ; volume 12, issue 3, page 45-50 ; ISSN 1234-567X",  # cr
            "Journal of Testing, Vol 10, Iss 2, Pp e123 (2020)",                   # ftdoajarticles
            "ZenodoRepo 42 (3) 10-20",                                               # ftzenodo
            "No parse available"                                                    # other: no match
        ],
        "repo": [
            "cr",
            "ftdoajarticles",
            "ftzenodo",
            "other"
        ]
    }
    df = pd.DataFrame(data)
    parsed_df = improved_df_parsing(df)
    # Check that the resulting DataFrame has the expected columns.
    for col in ["source", "volume", "issue", "page", "issn"]:
        assert col in parsed_df.columns

    # Row 0 (cr): Expect values parsed by parse_crossref.
    assert parsed_df.loc[0, "source"] == "Test Journal"
    assert parsed_df.loc[0, "volume"] == "12"
    assert parsed_df.loc[0, "issue"] == "3"
    assert parsed_df.loc[0, "page"] == "45-50"
    assert parsed_df.loc[0, "issn"] == "1234-567X"

    # Row 1 (ftdoajarticles)
    # We expect the source to be "Journal of Testing" and numeric strings for volume, issue, and page.
    assert parsed_df.loc[1, "source"].strip() == "Journal of Testing"
    assert parsed_df.loc[1, "volume"] == "10"
    assert parsed_df.loc[1, "issue"] == "2"
    assert parsed_df.loc[1, "page"] == "123"
    assert np.isnan(parsed_df.loc[1, "issn"])

    # Row 2 (ftzenodo)
    assert parsed_df.loc[2, "source"] == "ZenodoRepo"
    assert parsed_df.loc[2, "volume"] == "42"
    assert parsed_df.loc[2, "issue"] == "3"
    assert parsed_df.loc[2, "page"] == "10-20"
    assert np.isnan(parsed_df.loc[2, "issn"])

    # Row 3 (other): no matching parser branch, so all parsed fields should be np.nan.
    assert np.isnan(parsed_df.loc[3, "source"])
    assert np.isnan(parsed_df.loc[3, "volume"])
    assert np.isnan(parsed_df.loc[3, "issue"])
    assert np.isnan(parsed_df.loc[3, "page"])
    assert np.isnan(parsed_df.loc[3, "issn"])