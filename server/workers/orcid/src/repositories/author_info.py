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
    Amount,
    ProfessionalActivity
)
import re
from typing import Optional, Any
import calendar
import hashlib
import time
from itertools import chain


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

        activities = self.orcid.activities()
        if activities:
            author_info.services = self.extract_professional_activities_services(activities)

            # Calculate the total supervised students by degree level
            author_info.total_supervised_phd_students = self.count_supervised_students(
                author_info.services, degree="PhD"
            )
            author_info.total_supervised_master_students = self.count_supervised_students(
                author_info.services, degree="Master"
            )
            author_info.total_supervised_bachelor_students = self.count_supervised_students(
                author_info.services, degree="Bachelor"
            )

            # Metrics visibility settings (default hidden)
            # author_info.metrics_visibility = {
            #     "teaching": False,
            #     "mentorship": False
            # }

        self.logger.debug(f"author_info.services: {author_info.services}")

        return author_info
    
    def count_supervised_students(self, services: List[ProfessionalActivity], degree: str) -> int:
        """Counts supervised students for a specific degree based on keywords in the role,
        handling variations in degree formatting and extracting the exact number of students."""
        
        # Define degree variations
        degree_variants = {
            "PhD": ["phd", "ph.d.", "p.h.d.", "ph.d", "p.h.d"],
            "Master": ["master", "msc", "m.sc.", "m.a.", "ma"],
            "Bachelor": ["bachelor", "bsc", "b.sc.", "ba", "bs", "b.a."]
        }
        
        # Normalize the degree input to a known variant
        degree_keywords = degree_variants.get(degree, [degree.lower()])

        count = 0
        for service in services:
            role = service.role.lower()
            
            # Check for any variant of the degree within the role
            for keyword in degree_keywords:
                # Look for supervision/co-supervision followed by the degree keyword and "Number of students"
                degree_pattern = re.compile(
                    rf"(supervision|co-supervision|cosupervision):\s*{keyword}",
                    # rf"(supervision|co-supervision|teaching):\s*{keyword}.*?number of students:\s*(\d+)",
                    re.IGNORECASE
                )
                match = degree_pattern.search(role)
                
                if match:
                    # student_count = int(match.group(2))
                    # count += student_count
                    count += 1
                    break  # Stop if we find a matching degree variant

        return count
    
    def extract_professional_activities_services(self, activities: List[Dict[str, Dict[str, str]]]) -> List[ProfessionalActivity]:
        groups = get_nested_value(activities, ['services', 'affiliation-group'], [])
        summaries = list(chain.from_iterable(get_nested_value(group, ["summaries"], []) for group in groups))

        self.logger.debug(f'SUMMARIES FROM PROFESSIONAL ACTIVITIES {summaries}')
        
        professional_activities = []

        def format_address(address: Optional[Dict[str, str]]) -> str:
            """
            Safely formats the address as 'City, Region, Country', accounting for missing properties.

            :param address: A dictionary containing address properties (city, region, country)
            :return: A formatted address string or an empty string if the address is invalid/missing
            """
            if not isinstance(address, dict):
                return ""

            city = address.get("city", "").strip() if address.get("city") else ""
            region = address.get("region", "").strip() if address.get("region") else ""
            country = address.get("country", "").strip() if address.get("country") else ""

            # Join non-empty parts with a comma, skipping missing ones
            formatted_address = ", ".join(filter(None, [city, region, country]))
            return formatted_address
        
        for activity in summaries:
            role = get_nested_value(activity, ['service-summary', 'role-title'], '')
            department = get_nested_value(activity, ['service-summary', 'department-name'], '')
            start_date = get_nested_value(activity, ['service-summary', 'start-date', 'year', 'value'], '')
            end_date = get_nested_value(activity, ['service-summary', 'end-date', 'year', 'value'], '')
            organization = get_nested_value(activity, ['service-summary', 'organization', 'name'], '')
            
            # Get the organization address and format it
            organization_address_data = get_nested_value(activity, ['service-summary', 'organization', 'address'], {})
            organization_address = format_address(organization_address_data) # type: ignore
            
            professional_activity = ProfessionalActivity(
                id=unique_id(),
                role=role, # type: ignore
                department=department, # type: ignore
                start_date=start_date, # type: ignore
                end_date=end_date, # type: ignore
                organization=organization, # type: ignore
                organization_address=organization_address,
            )
            
            professional_activities.append(professional_activity)

        professional_activities = sorted(
            professional_activities,
            key=lambda activity: (
                self.parse_date_or_min(activity.end_date)
                if activity.end_date
                else (datetime.max if activity.start_date else datetime.min),
            ),
            reverse=True
        )
        
        return professional_activities
    
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

        def format_address(address: Optional[Dict[str, str]]) -> str:
            """
            Safely formats the address as 'City, Region, Country', accounting for missing properties.

            :param address: A dictionary containing address properties (city, region, country)
            :return: A formatted address string or an empty string if the address is invalid/missing
            """
            if not isinstance(address, dict):
                return ""

            city = address.get("city", "").strip() if address.get("city") else ""
            region = address.get("region", "").strip() if address.get("region") else ""
            country = address.get("country", "").strip() if address.get("country") else ""

            # Join non-empty parts with a comma, skipping missing ones
            formatted_address = ", ".join(filter(None, [city, region, country]))
            return formatted_address

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
                    organization_address_str = format_address(organization_address)

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
            result,
            key=lambda edu: (
                self.parse_date_or_min(edu.end_date)
                if edu.end_date
                else (datetime.max if edu.start_date else datetime.min),
            ),
            reverse=True
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
            result,
            key=lambda edu: (
                self.parse_date_or_min(edu.end_date)
                if edu.end_date
                else (datetime.max if edu.start_date else datetime.min),
            ),
            reverse=True
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
            result,
            key=lambda edu: (
                self.parse_date_or_min(edu.end_date)
                if edu.end_date
                else (datetime.max if edu.start_date else datetime.min),
            ),
            reverse=True
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
                amount=Amount(
                    currency=get_nested_value(funding, ["amount", "currency"], ""), # type: ignore
                    value=get_nested_value(funding, ["amount", "value"], ""), # type: ignore
                ),
            )
            for funding in funds
        ]

        sorted_result = sorted(
            result,
            key=lambda edu: (
                self.parse_date_or_min(edu.end_date)
                if edu.end_date
                else (datetime.max if edu.start_date else datetime.min),
            ),
            reverse=True
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
            result,
            key=lambda edu: (
                self.parse_date_or_min(edu.end_date)
                if edu.end_date
                else (datetime.max if edu.start_date else datetime.min),
            ),
            reverse=True
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
