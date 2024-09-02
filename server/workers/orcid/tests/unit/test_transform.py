import pytest
import pandas as pd
import numpy as np
from src.orcid_service import OrcidService

# Sample test data and expected outcomes
@pytest.fixture
def sample_author_info():
    # Sample author information dictionary
    return {
        "orcid_id": "0000-0002-1825-0097",
        "author_name": "John Doe",
        "biography": "A short biography",
        "author_keywords": "keyword1, keyword2",
        "academic_age": 14,
        "websites": [
            {"url_name": "personal", "url": "http://example.com"},
            {"url_name": "institutional", "url": "http://institution.com"}
        ],
        "external_identifiers": [
            {"type": "ResearcherID", "url": "http://researcherid.com", "value": "12345", "relationship": "self"},
            {"type": "Scopus", "url": "http://scopus.com", "value": "67890", "relationship": "self"}
        ],
        "countries": ["USA", "Canada"]
    }

@pytest.fixture
def sample_metadata():
    # Create a sample metadata DataFrame
    data = {
        'citation_count': [10, 20, 30, 40],
        'cited_by_accounts_count': [5, 2, 7, 3],
        'cited_by_wikipedia_count': [1, 0, 2, 0],
        'cited_by_msm_count': [0, 1, 1, 0],
        'cited_by_policies_count': [0, 0, 1, 0],
        'cited_by_patents_count': [0, 1, 0, 0],
        'year': [2005, 2010, 2015, 2020]
    }
    return pd.DataFrame(data)

def test_enrich_author_info(sample_author_info, sample_metadata):
    # Mock an instance of OrcidService (if enrich_author_info is an instance method)
    orcid_service = OrcidService(access_token="dummy_token", sandbox=True, redis_store=None)

    # Call the method to test
    enriched_info = orcid_service.enrich_author_info(sample_author_info, sample_metadata)

    # Assertions to check expected outcomes
    assert enriched_info["total_citations"] == 100
    assert enriched_info["total_unique_social_media_mentions"] == 17
    assert enriched_info["total_neppr"] == 7

    # Calculate h-index for given sample data
    citation_counts = sample_metadata["citation_count"].astype(float).sort_values(ascending=False).values
    expected_h_index = int(np.sum(citation_counts >= np.arange(1, len(citation_counts) + 1)))
    assert enriched_info["h_index"] == expected_h_index

    # Expected academic age calculation
    expected_academic_age = 14  # Earliest year from the sample data
    assert enriched_info["academic_age"] == expected_academic_age

    # Normalized h-index calculation
    expected_normalized_h_index = (expected_h_index / expected_academic_age) if expected_academic_age > 0 else 0
    assert enriched_info["normalized_h_index"] == expected_normalized_h_index