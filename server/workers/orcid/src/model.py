
from typing import TypedDict, List

class Website(TypedDict):
    url_name: str
    url: str


class ExternalIdentifier(TypedDict):
    type: str
    url: str
    value: str
    relationship: str


class AuthorInfo:
    # TODO: consider to rename it to something more generic, 
    # TODO: so that it will be possible to reuse between different client integerations
    orcid_id: str
    # TODO: consider to store First Name and Last Name separately, usually it's better
    # TODO: for data computation. The only issue we may face with this approach is that some 
    # TODO: data integrations may return author name as single field
    author_name: str
    biography: str
    author_keywords: str
    academic_age: str
    websites: List[Website]
    external_identifiers: List[ExternalIdentifier]
    countries: List[str]
