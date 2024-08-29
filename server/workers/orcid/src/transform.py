from datetime import datetime
import logging
from dateutil.parser import parse
from pyorcid import Orcid
import pandas as pd
import numpy as np
from common.decorators import error_logging_aspect
from common.utils import get_nested_value
from typing import List, Dict


@error_logging_aspect(log_level=logging.ERROR)
def extract_author_info(
    orcid_id: str,
    personal_details: Dict,
    keywords: List[str],
    education: List[Dict],
    orcid: Orcid
) -> dict:
    author_name = " ".join(
        [
            get_nested_value(personal_details, ["name", "given-names", "value"], ""),
            get_nested_value(personal_details, ["name", "family-name", "value"], ""),
        ]
    )
    author_keywords = ", ".join(keywords)
    biography = (
        get_nested_value(personal_details, ["biography", "content"], "")
        if (
            get_nested_value(personal_details, ["biography", "visibility"], "") == "public"
        )
        else ""
    )
    academic_age = calculate_academic_age(education)
    external_identifiers = extract_external_identifiers(orcid)
    countries = extract_countries(orcid)
    websites = extract_websites(orcid)
    
    author_info = {
        "orcid_id": orcid_id,
        "author_name": author_name,
        "author_keywords": author_keywords,
        "biography": biography,
        "websites": websites,
        "external_identifiers": external_identifiers,
        "country": countries,
        "academic_age": academic_age,
    }
    return author_info

def extract_countries(orcid: Orcid) -> list:
    countries = pd.DataFrame(orcid.address()["address"])
    if not countries.empty:
        countries = countries[countries["visibility"] == "public"]
        countries["country"] = countries["country"].apply(lambda x: x.get("value"))
        countries = countries["country"]
        return countries.tolist()
    else:
        return []

def calculate_academic_age(data):
    # Possible terms for a PhD-equivalent role
    doctoral_terms = [
        "phd", "dphil", "doctorate", "doctoral", 
        "edd", "dsc", "md-phd", "jd-phd", "dr.phil.", "dr.rer.nat.",
        "doctor of science", "doctor of education", "doctor's degree"
    ]

    # Find the PhD-equivalent end date
    phd_end_date = None
    for entry in data:
        # Check if the Role matches any PhD-equivalent term
        if any(term in entry["Role"].lower() for term in doctoral_terms):
            phd_end_date = entry["end-date"]
            break

    # If no PhD end date is found, return None
    if not phd_end_date:
        return None

    # Convert PhD end date to a datetime object
    phd_end_date = datetime.strptime(phd_end_date, "%m/%Y")

    # Calculate the number of years since the PhD
    current_date = datetime.now()
    academic_age = current_date.year - phd_end_date.year - ((current_date.month, current_date.day) < (phd_end_date.month, 1))

    return academic_age

def extract_external_identifiers(orcid: Orcid) -> list:
    external_identifiers = pd.DataFrame(
        orcid.external_identifiers()["external-identifier"]
    )
    if external_identifiers.empty:
        return []
    
    external_identifiers = external_identifiers[
        external_identifiers["visibility"] == "public"
    ]
    external_identifiers["external-id-url"] = external_identifiers[
        "external-id-url"
    ].apply(lambda x: x.get("value") if isinstance(x, dict) else "")
    
    return external_identifiers[
        [
            "external-id-type",
            "external-id-url",
            "external-id-value",
            "external-id-relationship",
        ]
    ].to_dict(orient="records")


def extract_websites(orcid: Orcid) -> list:
    urls = pd.DataFrame(orcid.researcher_urls()["researcher-url"])
    if not urls.empty:
        urls = urls[urls["visibility"] == "public"]
        urls["url"] = urls["url"].apply(lambda x: x.get("value"))
        urls = urls[["url-name", "url"]]
        return urls.to_dict(orient="records")
    else:
        return []

@error_logging_aspect(log_level=logging.WARNING)
def sanitize_metadata(metadata: pd.DataFrame) -> pd.DataFrame:
    """
    This function sanitizes the metadata DataFrame by converting all columns
    to string type and filling missing values with an empty string.

    Parameters:
    - metadata (pd.DataFrame): The metadata DataFrame to sanitize.

    Returns:
    - pd.DataFrame: The sanitized metadata DataFrame.
    """
    metadata["title"] = metadata["title"].fillna("").astype(str)
    metadata["subtitle"] = metadata["subtitle"].fillna("").astype(str)
    metadata["paper_abstract"] = metadata["paper_abstract"].fillna("").astype(str)
    metadata["published_in"] = metadata["published_in"].fillna("").astype(str)
    return metadata


@error_logging_aspect(log_level=logging.ERROR)
def retrieve_full_works_metadata(works_data: pd.DataFrame) -> pd.DataFrame:
    """
    This function transforms the works data to extract the full metadata for each work.

    Parameters:
    - works_data (pd.DataFrame): The works data DataFrame to transform.

    Returns:
    - pd.DataFrame: The transformed works data DataFrame with full metadata.
    """
    
    new_works_data = pd.DataFrame()

    if works_data.empty:
        return new_works_data

    # Perform transformations and store in new DataFrame
    new_works_data["id"] = works_data.apply(get_put_code, axis=1).astype(str)
    new_works_data["title"] = works_data.apply(get_title, axis=1)
    new_works_data["subtitle"] = works_data.apply(get_subtitle, axis=1)
    new_works_data["authors"] = works_data.apply(get_authors, axis=1)
    new_works_data["paper_abstract"] = works_data.apply(
        get_paper_abstract, axis=1
    ).fillna("")
    new_works_data["year"] = works_data.apply(get_publication_date, axis=1)
    new_works_data["published_in"] = works_data.apply(published_in, axis=1)
    new_works_data["resulttype"] = works_data.apply(get_resulttype, axis=1).map(
        lambda x: doc_type_mapping.get(x, "")
    )
    new_works_data["doi"] = works_data.apply(extract_dois, axis=1)
    new_works_data["subject"] = ""  # this needs to come from BASE enrichment
    new_works_data["url"] = works_data.apply(get_url, axis=1)
    new_works_data["link"] = works_data.apply(get_link, axis=1)
    new_works_data["oa_state"] = new_works_data.link.map(lambda x: 1 if x else 2)

    return new_works_data


def get_authors(work) -> str:
    contributors = get_nested_value(work, ["contributors", "contributor"], [])

    authors = []

    for contributor in contributors:
        author = get_nested_value(contributor, ["credit-name", "value"], None)

        if author:
            authors.append(author)

    return "; ".join(authors)


def get_title(work) -> str:
    return get_nested_value(work, ["title", "title", "value"], "")


def get_subtitle(work) -> str:
    return get_nested_value(work, ["title", "subtitle", "value"], "")


def get_paper_abstract(work) -> str:
    return get_nested_value(work, ["short-description"], "")


def get_resulttype(work) -> str:
    return get_nested_value(work, ["type"], "")


def published_in(work) -> str:
    return get_nested_value(work, ["journal-title", "value"], "")


def get_put_code(work) -> str:
    return get_nested_value(work, ["put-code"], "")


def get_url(work) -> str:
    # Try to get the primary URL
    url = get_nested_value(work, ["url", "value"], "")
    if url:
        return url
    
    # Fallback to checking external IDs if no URL was found
    ids = get_nested_value(work, ["external-ids", "external-id"], [])
    if isinstance(ids, list):
        for id in ids:
            external_url = id.get("external-id-value", "")
            if external_url.startswith("http"):
                return external_url

    return ""


def get_link(work) -> str:
    url = get_nested_value(work, ["url", "value"], "")
    if url.lower().endswith(".pdf"):
        return url
    return ""


def filter_dicts_by_value(dicts: List[dict], key, value) -> list:
    return [d for d in dicts if d.get(key) == value]


def extract_dois(work: pd.DataFrame) -> str:
    external_ids = get_nested_value(work, ["external-ids", "external-id"], [])
    
    if not isinstance(external_ids, list) or not external_ids:
        return ""
    
    dois = [
        eid.get("external-id-value", "")
        for eid in external_ids
        if eid.get("external-id-type") == "doi"
    ]
    
    return dois[0] if dois else ""


def get_publication_date(work) -> str:
    year = get_nested_value(work, ["publication-date", "year", "value"], np.nan)
    month = get_nested_value(work, ["publication-date", "month", "value"], np.nan)
    day = get_nested_value(work, ["publication-date", "day", "value"], np.nan)

    publication_date = ""
    parsed_publication_date = publication_date
    if year is not np.nan:
        publication_date += str(int(year))
        parsed_publication_date = publication_date
    if month is not np.nan and month != "00":
        publication_date += "-" + str(int(month))
        date_obj = parse(publication_date)
        parsed_publication_date = date_obj.strftime("%Y-%m")
    if day is not np.nan:
        publication_date += "-" + str(int(day))
        date_obj = parse(publication_date)
        parsed_publication_date = date_obj.strftime("%Y-%m-%d")
    return parsed_publication_date


doc_type_mapping = {
    "book": "Book",
    "book-chapter": "Book chapter",
    "book-review": "Book review",
    "dictionary-entry": "Dictionary entry",
    "dissertation": "Dissertation",
    "dissertation-thesis": "Dissertation thesis",
    "enyclopaedia-entry": "Encyclopedia entry",
    "edited-book": "Edited book",
    "journal-article": "Journal article",
    "journal-issue": "Journal issue",
    "magazine-article": "Magazine article",
    "manual": "Manual",
    "online-resource": "Online resource",
    "newsletter-article": "Newsletter article",
    "newspaper-article": "Newspaper article",
    "preprint": "Preprint",
    "report": "Report",
    "review": "Review",
    "research-tool": "Research tool",
    "supervised-student-publication": "Supervised student publication",
    "test": "Test",
    "translation": "Translation",
    "website": "Website",
    "working-paper": "Working paper",
    "conference-abstract": "Conference abstract",
    "conference-paper": "Conference paper",
    "conference-poster": "Conference poster",
    "disclosure": "Disclosure",
    "license": "License",
    "patent": "Patent",
    "registered-copyright": "Registered copyright",
    "trademark": "Trademark",
    "annotation": "Annotation",
    "artistic-performance": "Artistic performance",
    "data-management-plan": "Data management plan",
    "data-set": "Dataset",
    "invention": "Invention",
    "lecture-speech": "Lecture speech",
    "physical-object": "Physical object",
    "research-technique": "Research technique",
    "software": "Software",
    "spin-off-company": "Spin-off company",
    "standards-and-policy": "Standards and policy",
    "technical-standard": "Technical standard",
    "other": "Other",
}
