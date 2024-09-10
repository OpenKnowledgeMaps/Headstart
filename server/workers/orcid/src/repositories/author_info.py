import logging
from datetime import datetime
from pyorcid import Orcid
import pandas as pd
from common.utils import get_nested_value
from typing import List, Dict
from model import AuthorInfo, ExternalIdentifier, Website


class AuthorInfoRepository:
    logger = logging.getLogger(__name__)

    def __init__(self, orcid: Orcid) -> None:
        self.orcid = orcid

    def extract_author_info(self) -> AuthorInfo:
        author_info = AuthorInfo(
            orcid_id=self.orcid._orcid_id
        )

        personal_details = self.orcid.personal_details()
        author_info.author_name = self.extract_author_name(personal_details)
        author_info.biography = self.extract_biography(personal_details)
        
        keywords, _ = self.orcid.keywords()
        author_info.author_keywords = ", ".join(keywords)

        education, _ = self.orcid.educations()
        author_info.academic_age = self.calculate_academic_age(education)

        external_identifiers = self.orcid.external_identifiers()["external-identifier"]
        author_info.external_identifiers = self.extract_external_identifiers(external_identifiers)

        addresses = self.orcid.address()["address"]
        author_info.countries = self.extract_countries(addresses)
        
        researcher_urls = self.orcid.researcher_urls()["researcher-url"]
        author_info.websites = self.extract_websites(researcher_urls)

        return author_info

    def extract_author_name(self, personal_details: Dict[str, str]) -> str:
        return " ".join(
            [
                get_nested_value(personal_details, ["name", "given-names", "value"], ""),
                get_nested_value(personal_details, ["name", "family-name", "value"], ""),
            ]
        )

    def extract_biography(self, personal_details: Dict[str, str]) -> str:
        return (
            get_nested_value(personal_details, ["biography", "content"], "")
            if (
                get_nested_value(personal_details, ["biography", "visibility"], "") == "public"
            )
            else ""
        )

    def extract_countries(self, addresses: List[Dict[str, str]]) -> List[str]:
        countries = pd.DataFrame(addresses)
        if countries.empty:
            return []
        countries = countries[countries["visibility"] == "public"]
        countries["country"] = countries["country"].apply(lambda x: x.get("value") if isinstance(x, dict) else "")
        countries = countries["country"]
        return countries.tolist()

    def calculate_academic_age(self, data: List[Dict[str, str]]) -> int:
        # Possible terms for a PhD-equivalent role
        doctoral_terms = [
            "phd", "dphil", "doctorate", "doctoral", 
            "edd", "dsc", "md-phd", "jd-phd", "dr.phil.", "dr.rer.nat.",
            "doctor of science", "doctor of education", "doctor's degree",
            "ph.d"
        ]

        # Find the PhD-equivalent end date
        phd_end_date = None
        for entry in reversed(data):
            # Check if Role exists and is not None, and if it matches any PhD-equivalent term
            role = entry.get("Role", "").lower() if entry.get("Role") else ""
            if any(term in role for term in doctoral_terms):
                phd_end_date = entry["end-date"]
                break

        # If no PhD end date is found, return None
        if not phd_end_date:
            return None

        # Convert PhD end date to a datetime object
        try:
            # Try to parse using "month/year" format
            phd_end_date = datetime.strptime(phd_end_date, "%m/%Y")
        except ValueError:
            # Fallback to parse using "year" format if the above fails
            phd_end_date = datetime.strptime(phd_end_date, "%Y")

        # Calculate the number of years since the PhD
        current_date = datetime.now()
        academic_age = current_date.year - phd_end_date.year - ((current_date.month, current_date.day) < (phd_end_date.month, 1))

        return academic_age

    def extract_external_identifiers(
            self,
            data: List[Dict[str, str]]
        ) -> List[ExternalIdentifier]:
            external_identifiers = pd.DataFrame(data)

            if external_identifiers.empty:
                return []

            # Filter the rows where visibility is 'public'
            external_identifiers = external_identifiers[
                external_identifiers["visibility"] == "public"
            ]

            # Handle the 'external-id-url' column
            external_identifiers["external-id-url"] = external_identifiers[
                "external-id-url"
            ].apply(lambda x: x.get("value") if isinstance(x, dict) else "")

            # Rename columns by removing the 'external-id-' prefix
            external_identifiers.rename(columns=lambda x: x.replace("external-id-", ""), inplace=True)

            # Return the required columns as a list of dictionaries
            return external_identifiers[
                [
                    "type",
                    "url",
                    "value",
                    "relationship",
                ]
            ].to_dict(orient="records")

    def extract_websites(self, researcher_urls: List[Dict[str, str]]) -> List[Website]:
        urls = pd.DataFrame(researcher_urls)

        if urls.empty:
            return []

        urls = urls[urls["visibility"] == "public"]
        urls["url"] = urls["url"].apply(lambda x: x.get("value"))
        urls = urls[["url-name", "url"]]
        return urls.to_dict(orient="records")
