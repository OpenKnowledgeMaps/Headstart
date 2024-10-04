import logging
from datetime import datetime, timedelta
from pyorcid import Orcid
import pandas as pd
import numpy as np
from common.utils import get_nested_value
from typing import List, Dict
from model import (
    AuthorInfo,
    ExternalIdentifier,
    ResearcherUrl,
    Website,
    Employment,
    Funding,
    Education,
    Membership,
    PeerReview,
    Distinction,
)
from typing import Optional, Any
import calendar
import hashlib
import time


def unique_id():
    unique_string = str(
        time.time()
    ).encode()  # Encode a unique string (e.g., timestamp)
    short_unique_id = hashlib.md5(unique_string).hexdigest()[
        :8
    ]  # Get first 8 characters of the hash
    return short_unique_id


class AuthorInfoRepository:
    logger = logging.getLogger(__name__)

    def __init__(self, orcid: Orcid) -> None:
        self.orcid = orcid

    def extract_author_info(self) -> AuthorInfo:
        author_info = AuthorInfo(orcid_id=self.orcid._orcid_id)

        personal_details = self.orcid.personal_details()
        author_info.author_name = self.extract_author_name(personal_details)
        author_info.biography = self.extract_biography(personal_details)

        keywords, _ = self.orcid.keywords()
        author_info.author_keywords = ", ".join(keywords)

        education, _ = self.orcid.educations()
        author_info.educations = self.extract_educations(education)
        author_info.academic_age = self.calculate_academic_age(education)

        researcher_urls = self.orcid.researcher_urls()
        author_info.researcher_urls = self.extract_researcher_urls(
            researcher_urls
        )

        addresses = self.orcid.address()["address"]
        author_info.countries = self.extract_countries(addresses)

        researcher_urls = self.orcid.researcher_urls()["researcher-url"]
        author_info.websites = self.extract_websites(researcher_urls)

        employments, _ = self.orcid.employments()
        if employments:
            author_info.employment = self.extract_employment(employments)
            author_info.employments = self.extract_employments(employments)

        memberships, _ = self.orcid.memberships()
        if memberships:
            author_info.memberships = self.extract_memberships(memberships)

        funds, _ = self.orcid.funds_enriched()
        if funds:
            author_info.funds = self.extract_funds(funds)

        peer_reviews = self.orcid.peer_reviews()
        if peer_reviews:
            author_info.peer_reviews = self.extract_peer_reviews(peer_reviews)

        distinctions, _ = self.orcid.distinctions()
        if distinctions:
            author_info.distinctions = self.extract_distinctions(distinctions)

        return author_info
    
    def extract_researcher_urls(self, researcher_urls: Dict[str, Dict[str, str]]) -> List[ResearcherUrl]:
        return [
            ResearcherUrl(
                id=unique_id(),
                url=get_nested_value(url, ["url", "value"], None), # type: ignore
                url_name=get_nested_value(url, ["url-name"], None), # type: ignore
            )
            for url in researcher_urls.get('researcher-url', [])
        ]

    def extract_peer_reviews(self, peer_reviews: Any) -> List[PeerReview]:
        peer_review_list = []

        peer_review_groups = peer_reviews.get("group", [])

        for peer_review_group in peer_review_groups:
            peer_reviews = peer_review_group.get("peer-review-group", [])
            for peer_review in peer_reviews:
                summaries = peer_review.get("peer-review-summary", [])
                for summary in summaries:
                    organization_name = get_nested_value(
                        summary, ["convening-organization", "name"], None
                    )
                    organization_address = get_nested_value(
                        summary, ["convening-organization", "address"], {}
                    )
                    organization_address_str = f"{organization_address.get('city', '')}, {organization_address.get('region', '')}, {organization_address.get('country', '')}"

                    peer_review_list.append(
                        PeerReview(
                            id=unique_id(),
                            role=summary.get("reviewer-role", None),
                            type=summary.get("review-type", None),
                            url=summary.get("review-url", None),
                            completion_date=self.get_completion_date(summary),
                            organization=organization_name,
                            organization_address=organization_address_str,
                        )
                    )

        return peer_review_list

    def extract_memberships(
        self, memberships: List[Dict[str, str]]
    ) -> List[Membership]:
        result = [
            Membership(
                id=unique_id(),
                organization=membership.get("organization", ""),
                organization_address=membership.get("organization-address", ""),
                department=membership.get("Department", ""),
                role=membership.get("Role", ""),
                start_date=membership.get("start-date", ""),
                end_date=membership.get("end-date", ""),
            )
            for membership in memberships
        ]

        sorted_result = sorted(
            result, key=lambda mem: self.parse_date_or_max(mem.start_date), reverse=True
        )

        return sorted_result

    def extract_educations(self, educations: List[Dict[str, str]]) -> List[Education]:
        result = [
            Education(
                id=unique_id(),
                department=education.get("Department", None),
                role=education.get("Role", None),
                start_date=education.get("start-date", ""),
                end_date=education.get("end-date", ""),
                organization=education.get("organization", ""),
                organization_address=education.get("organization-address", ""),
                url=education.get("url", ""),
            )
            for education in educations
        ]

        sorted_result = sorted(
            result, key=lambda edu: self.parse_date_or_max(edu.start_date), reverse=True
        )

        return sorted_result

    def extract_distinctions(
        self, distinctions: List[Dict[str, str]]
    ) -> List[Distinction]:
        result = [
            Distinction(
                id=unique_id(),
                department=distinction.get("Department", None),
                role=distinction.get("Role", None),
                start_date=distinction.get("start-date", ""),
                end_date=distinction.get("end-date", ""),
                organization=distinction.get("organization", ""),
                organization_address=distinction.get("organization-address", ""),
                url=distinction.get("url", ""),
            )
            for distinction in distinctions
        ]

        sorted_result = sorted(
            result, key=lambda dist: self.parse_date_or_max(dist.start_date), reverse=True
        )

        return sorted_result

    def extract_funds(self, funds: List[Dict[str, str]]) -> List[Funding]:
        result = [
            Funding(
                id=unique_id(),
                title=funding.get("title", ""),
                type=funding.get("type", ""),
                start_date=funding.get("start-date", ""),
                end_date=funding.get("end-date", ""),
                organization=funding.get("organization", ""),
                organization_address=funding.get("organization-address", ""),
                url=funding.get("url", ""),
            )
            for funding in funds
        ]

        sorted_result = sorted(
            result, key=lambda fund: self.parse_date_or_max(fund.start_date), reverse=True
        )

        return sorted_result

    def parse_date(self, date_str: str) -> Optional[datetime]:
        """Attempts to parse a date string in 'YYYY' or 'MM/YYYY' format."""
        if not date_str:
            return None  # Handle empty or None date strings

        date_str = date_str.strip()  # Remove any leading/trailing whitespace

        try:
            # Try to parse in 'MM/YYYY' format if a slash is present
            if "/" in date_str:
                return datetime.strptime(date_str, "%m/%Y")
            # Otherwise, assume it's in 'YYYY' format
            return datetime.strptime(date_str, "%Y")
        except ValueError:
            # Return None or consider returning datetime.min as a fallback
            return None

    def parse_date_or_min(self, date_str: Optional[str]) -> datetime:
        if not date_str:
            return datetime.min

        date = self.parse_date(date_str)

        if date:
            return date

        return datetime.min

    def parse_date_or_max(self, date_str: Optional[str]) -> datetime:
        if not date_str:
            return datetime.max

        date = self.parse_date(date_str)

        if date:
            return date

        return datetime.max

    def extract_employment(
        self, employments: List[Dict[str, str]]
    ) -> Optional[Employment]:
        employment = employments[0] if employments else None

        if not employment:
            return None

        end_date_str = employment.get("end-date", "")

        if end_date_str:  # Only proceed if end_date is not an empty string
            end_date = self.parse_date(end_date_str)
            if not end_date:  # If end_date couldn't be parsed, return None
                return None

            # Check if end_date is more than half a year from now
            half_year_from_now = datetime.now() + timedelta(days=182)
            if end_date > half_year_from_now:
                return None

        return Employment(
            id=unique_id(),
            organization=employment.get("organization", None),
            organization_address=employment.get("organization-address", None),
            department=employment.get("department", None),
            role=employment.get("Role", None),
            start_date=employment.get("start-date", ""),
            end_date=end_date_str,
        )

    def extract_employments(
        self, employments: List[Dict[str, str]]
    ) -> List[Employment]:
        result = [
            Employment(
                id=unique_id(),
                organization=employment.get("organization", None),
                department=employment.get("department", None),
                role=employment.get("Role", None),
                start_date=employment.get("start-date", ""),
                end_date=employment.get("end-date", ""),
            )
            for employment in employments
        ]

        sorted_result = sorted(
            result, key=lambda emp: self.parse_date_or_max(emp.start_date), reverse=True
        )

        return sorted_result

    def extract_author_name(self, personal_details: Dict[str, str]) -> str:
        return " ".join(
            [
                str(
                    get_nested_value(
                        personal_details, ["name", "given-names", "value"], ""
                    )
                ),
                str(
                    get_nested_value(
                        personal_details, ["name", "family-name", "value"], ""
                    )
                ),
            ]
        )

    def extract_biography(self, personal_details: Dict[str, str]) -> str:
        return (
            str(get_nested_value(personal_details, ["biography", "content"], ""))
            if (
                str(get_nested_value(personal_details, ["biography", "visibility"], ""))
                == "public"
            )
            else ""
        )

    def extract_countries(self, addresses: List[Dict[str, str]]) -> List[str]:
        countries = pd.DataFrame(addresses)
        if countries.empty:
            return []
        countries = countries[countries["visibility"] == "public"]
        countries["country"] = countries["country"].apply(
            lambda x: x.get("value") if isinstance(x, dict) else ""
        )
        countries = countries["country"]
        return countries.tolist()

    def calculate_academic_age(self, data: List[Dict[str, str]]) -> Optional[int]:
        # Possible terms for a PhD-equivalent role
        doctoral_terms = [
            "phd",
            "dphil",
            "doctorate",
            "doctoral",
            "edd",
            "dsc",
            "md-phd",
            "jd-phd",
            "dr.phil.",
            "dr.rer.nat.",
            "doctor of science",
            "doctor of education",
            "doctor's degree",
            "ph.d",
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
        academic_age = (
            current_date.year
            - phd_end_date.year
            - ((current_date.month, current_date.day) < (phd_end_date.month, 1))
        )

        return academic_age

    def extract_external_identifiers(
        self, data: List[Dict[str, str]]
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
        external_identifiers.rename(
            columns=lambda x: x.replace("external-id-", ""), inplace=True
        )

        # Return the required columns as a list of dictionaries
        return external_identifiers[
            [
                "type",
                "url",
                "value",
                "relationship",
            ]
        ].to_dict(orient="records")  # type: ignore

    def extract_websites(self, researcher_urls: List[Dict[str, str]]) -> List[Website]:
        urls = pd.DataFrame(researcher_urls)

        if urls.empty:
            return []

        urls = urls[urls["visibility"] == "public"]
        urls["url"] = urls["url"].apply(lambda x: x.get("value"))
        urls = urls[["url-name", "url"]]
        return urls.to_dict(orient="records")  # type: ignore

    def get_completion_date(self, summary) -> Optional[str]:
        year = get_nested_value(summary, ["completion-date", "year", "value"], np.nan)
        month = get_nested_value(summary, ["completion-date", "month", "value"], np.nan)
        day = get_nested_value(summary, ["completion-date", "day", "value"], np.nan)

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
