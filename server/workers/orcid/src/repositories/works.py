import logging
from dateutil.parser import parse
from pyorcid import Orcid
import pandas as pd
import numpy as np
from common.utils import get_nested_value
from typing import Optional
import calendar

class WorksRepository:
    logger = logging.getLogger(__name__)

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
        new_works_data["title"] = works_data.apply(self.get_title, axis=1)
        new_works_data["subtitle"] = works_data.apply(self.get_subtitle, axis=1)
        new_works_data["authors"] = works_data.apply(self.get_authors, axis=1)
        new_works_data["paper_abstract"] = works_data.apply(
            self.get_paper_abstract, axis=1
        ).astype(str)
        new_works_data["year"] = works_data.apply(self.get_publication_date, axis=1)
        new_works_data["published_in"] = works_data.apply(self.published_in, axis=1).astype(str)
        new_works_data["resulttype"] = works_data.apply(self.get_resulttype, axis=1).map(
            lambda x: doc_type_mapping.get(x, "")
        )
        new_works_data["subject"] = ""  # this needs to come from BASE enrichment
        new_works_data["doi"] = works_data.apply(self.extract_doi, axis=1)
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
        return get_nested_value(work, ["title", "title", "value"], None)

    def get_subtitle(self, work) -> str:
        return get_nested_value(work, ["title", "subtitle", "value"], None)

    def get_paper_abstract(self, work) -> str:
        return get_nested_value(work, ["short-description"], None)

    def get_resulttype(self, work) -> str:
        return get_nested_value(work, ["type"], None)

    def published_in(self, work) -> str:
        return get_nested_value(work, ["journal-title", "value"], None)

    def get_put_code(self, work) -> str:
        put_code = get_nested_value(work, ["put-code"], None)
        return str(put_code) if put_code else None
    
    def get_url(self, work) -> Optional[str]:
        url = get_nested_value(work, ["url", "value"], None)
        if url:
            return url

        ids = get_nested_value(work, ["external-ids", "external-id"], [])
        if isinstance(ids, list):
            for id in ids:
                external_id_value = id.get("external-id-value", None)
                external_id_url = get_nested_value(id, ["external-id-url", "value"], None)
                external_id_type = get_nested_value(id, ["external-id-type"], "").lower()

                if external_id_url:
                    return external_id_url

                if external_id_value.startswith("http"):
                    return external_id_value

                if external_id_type == "doi":
                    return f"https://doi.org/{external_id_value}"
                if external_id_type == "isbn":
                    return f"https://books.google.pl/books?vid=ISBN{external_id_value}&redir_esc=y&hl=en"
                if external_id_type == "arxiv":
                    return f"https://arxiv.org/abs/{external_id_value}"
                self.logger.warning(f"Unknown external id type: {external_id_type}. {id}")

        return None

    def get_link(self, work) -> str:
        url = get_nested_value(work, ["url", "value"], "")
        if url.lower().endswith(".pdf"):
            return url
        return None

    def extract_doi(self, work: pd.DataFrame) -> Optional[str]:
        external_ids = get_nested_value(work, ["external-ids", "external-id"], [])

        if not isinstance(external_ids, list) or not external_ids:
            return None

        for eid in external_ids:
            if eid.get("external-id-type") == "doi":
                return eid.get("external-id-value", None)

        return None

    def get_publication_date(self, work) -> str:
        year = get_nested_value(work, ["publication-date", "year", "value"], np.nan)
        month = get_nested_value(work, ["publication-date", "month", "value"], np.nan)
        day = get_nested_value(work, ["publication-date", "day", "value"], np.nan)

        if year is np.nan or not (1 <= int(year) <= 9999):
            return None

        year = int(year)
        result_date = str(year)

        if month is not np.nan:
            month = int(month)
            if 1 <= month <= 12:
                result_date += f"-{month:02d}"

                if day is not np.nan:
                    day = int(day)
                    max_day = calendar.monthrange(year, month)[1]
                    if 1 <= day <= max_day:
                        result_date += f"-{day:02d}" 
                        return result_date
                return result_date 
            else:
                return str(year)
        else:
            return str(year) 

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
