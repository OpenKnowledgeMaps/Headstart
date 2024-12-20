
from dataclasses import dataclass, field
from typing import Any, TypedDict, List, Optional

class SuccessResult(TypedDict):
    status: str
    data: Any

class ErrorResult(TypedDict):
    status: str
    reason: List[str]

@dataclass
class Params:
    orcid: str
    limit: str

@dataclass
class Website:
    url_name: str
    url: str


@dataclass
class ExternalIdentifier:
    type: str
    url: str
    value: str
    relationship: str

@dataclass
class ResearcherUrl:
    id: str
    url_name: Optional[str] = None
    url: Optional[str] = None

@dataclass
class Employment:
    id: str
    organization: Optional[str] = None
    organization_address: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

@dataclass
class Distinction:
    id: str
    organization: Optional[str] = None
    organization_address: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    url: Optional[str] = None

@dataclass
class Membership:
    id: str
    organization: Optional[str] = None
    organization_address: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

@dataclass
class Amount:
    currency: str
    value: float

@dataclass
class Funding:
    id: str
    title: str
    type: str
    start_date: str
    end_date: str
    organization: str
    organization_address: str
    url: str
    amount: Optional[Amount] = None

@dataclass
class Education:
    id: str
    department: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    organization: Optional[str] = None
    organization_address: Optional[str] = None
    url: Optional[str] = None

@dataclass
class PeerReview:
    id: str
    type: Optional[str] = None
    role: Optional[str] = None
    url: Optional[str] = None
    completion_date: Optional[str] = None
    organization: Optional[str] = None
    organization_address: Optional[str] = None
    # organization_address

@dataclass
class ProfessionalActivity:
    id: str
    role: str
    department: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    organization: Optional[str] = None
    organization_address: Optional[str] = None

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
    academic_age: Optional[int] = None
    websites: List['Website'] = field(default_factory=list)
    external_identifiers: List[ExternalIdentifier] = field(default_factory=list)
    researcher_urls: List[ResearcherUrl] = field(default_factory=list)
    countries: List[str] = field(default_factory=list)
    total_citations: Optional[int] = None
    total_unique_social_media_mentions: Optional[int] = None
    total_neppr: Optional[int] = None
    h_index: Optional[int] = None
    normalized_h_index: Optional[float] = None
    employment: Optional[Employment] = None
    total_supervised_phd_students: Optional[int] = None
    total_supervised_master_students: Optional[int] = None
    total_supervised_bachelor_students: Optional[int] = None
    employments: List[Employment] = field(default_factory=list)
    funds: List[Funding] = field(default_factory=list)
    educations: List[Education] = field(default_factory=list)
    memberships: List[Membership] = field(default_factory=list)
    peer_reviews: List[PeerReview] = field(default_factory=list)
    distinctions: List[Distinction] = field(default_factory=list)
    services: List[ProfessionalActivity] = field(default_factory=list)
    

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
