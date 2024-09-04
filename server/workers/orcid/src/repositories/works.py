from dateutil.parser import parse
from pyorcid import Orcid
import pandas as pd
import numpy as np
from common.utils import get_nested_value

class WorksRepository:
    def __init__(self, orcid: Orcid) -> None:
        self.orcid = orcid

    def get_full_works_metadata(self, limit: int = 10000) -> pd.DataFrame:
        """
        This function retrieves the full metadata for all works associated with an ORCID.

        Parameters:
        - orcid (Orcid): The Orcid object to use for retrieving the works data.

        Returns:
        - pd.DataFrame: The full metadata for all works associated with the ORCID.
        """
        
        works_data = self.orcid.works_full_metadata()
        return self.transform_works_metadata(pd.DataFrame(works_data))

    def transform_works_metadata(self, works_data: pd.DataFrame) -> pd.DataFrame:
        new_works_data = pd.DataFrame()

        if works_data.empty:
            return new_works_data

        # Perform transformations and store in new DataFrame
        new_works_data["id"] = works_data.apply(self.get_put_code, axis=1).astype(str)
        new_works_data["title"] = works_data.apply(self.get_title, axis=1).astype(str)
        new_works_data["subtitle"] = works_data.apply(self.get_subtitle, axis=1).astype(str)
        new_works_data["authors"] = works_data.apply(self.get_authors, axis=1)
        new_works_data["paper_abstract"] = works_data.apply(
            self.get_paper_abstract, axis=1
        ).astype(str)
        new_works_data["year"] = works_data.apply(self.get_publication_date, axis=1)
        new_works_data["published_in"] = works_data.apply(self.published_in, axis=1).astype(str)
        new_works_data["resulttype"] = works_data.apply(self.get_resulttype, axis=1).map(
            lambda x: doc_type_mapping.get(x, "")
        )
        new_works_data["doi"] = works_data.apply(self.extract_dois, axis=1)
        new_works_data["subject"] = ""  # this needs to come from BASE enrichment
        new_works_data["url"] = works_data.apply(self.get_url, axis=1)
        new_works_data["link"] = works_data.apply(self.get_link, axis=1)
        new_works_data["oa_state"] = new_works_data.link.map(lambda x: 1 if x else 2)

        return new_works_data

    def get_authors(self, work) -> str:
        contributors = get_nested_value(work, ["contributors", "contributor"], [])

        authors = []

        for contributor in contributors:
            author = get_nested_value(contributor, ["credit-name", "value"], None)

            if author:
                authors.append(author)

        return "; ".join(authors)

    def get_title(self, work) -> str:
        return get_nested_value(work, ["title", "title", "value"], "")

    def get_subtitle(self, work) -> str:
        return get_nested_value(work, ["title", "subtitle", "value"], "")

    def get_paper_abstract(self, work) -> str:
        return get_nested_value(work, ["short-description"], "")

    def get_resulttype(self, work) -> str:
        return get_nested_value(work, ["type"], "")

    def published_in(self, work) -> str:
        return get_nested_value(work, ["journal-title", "value"], "")

    def get_put_code(self, work) -> str:
        return get_nested_value(work, ["put-code"], "")

    def get_url(self, work) -> str:
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

    def get_link(self, work) -> str:
        url = get_nested_value(work, ["url", "value"], "")
        if url.lower().endswith(".pdf"):
            return url
        return ""

    def extract_dois(self, work: pd.DataFrame) -> str:
        external_ids = get_nested_value(work, ["external-ids", "external-id"], [])
        
        if not isinstance(external_ids, list) or not external_ids:
            return ""
        
        dois = [
            eid.get("external-id-value", "")
            for eid in external_ids
            if eid.get("external-id-type") == "doi"
        ]
        
        return dois[0] if dois else ""

    def get_publication_date(self, work) -> str:
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
