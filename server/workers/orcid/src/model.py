
from dataclasses import dataclass, field
from typing import TypedDict, List, Optional


@dataclass
class Website(TypedDict):
    url_name: str
    url: str


@dataclass
class ExternalIdentifier(TypedDict):
    type: str
    url: str
    value: str
    relationship: str


@dataclass
class AuthorInfo:
    # TODO: consider renaming it to something more generic,
    # TODO: so that it will be possible to reuse between different client integrations
    orcid_id: str
    # TODO: consider storing First Name and Last Name separately, usually it's better
    # TODO: for data computation. The only issue we may face with this approach is that some 
    # TODO: data integrations may return author name as a single field
    author_name: Optional[str] = None
    biography: Optional[str] = None
    author_keywords: Optional[str] = None
    academic_age: Optional[str] = None
    websites: List['Website'] = field(default_factory=list)
    external_identifiers: List['ExternalIdentifier'] = field(default_factory=list)
    countries: List[str] = field(default_factory=list)
    total_citations: Optional[int] = None
    total_unique_social_media_mentions: Optional[int] = None
    total_neppr: Optional[int] = None
    h_index: Optional[int] = None
    normalized_h_index: Optional[int] = None


@dataclass
class Work:
    id: str
    identifier: str
    authors: str
    title: str
    subtitle: str
    paper_abstract: str
    year: int
    oa_state: str
    subject_orig: str
    subject_cleaned: str
    relevance: str
    link: str
    published_in: str
    fulltext: str
    language: str
    subject: str
    url: str
    relation: str
    resulttype: str
    doi: str
    citation_count: int
    cited_by_accounts_count: int
    cited_by_wikipedia_count: int
    cited_by_msm_count: int
    cited_by_policies_count: int
    cited_by_patents_count: int
