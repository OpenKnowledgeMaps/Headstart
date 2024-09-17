from dataclasses import dataclass
import json
from typing import Optional

@dataclass
class AuthorInfo:
    # TODO: consider to rename it to something more generic, 
    # TODO: so that it will be possible to reuse between different client integerations
    orcid_id: str
    # TODO: consider to store First Name and Last Name separately, usually it's better
    # TODO: for data computation. The only issue we may face with this approach is that some 
    # TODO: data integrations may return author name as single field
    author_name: Optional[str] = None
    biography: Optional[str] = None
    author_keywords: Optional[str] = None
    academic_age: Optional[str] = None
    total_citations: Optional[int] = None
    total_unique_social_media_mentions: Optional[int] = None
    total_neppr: Optional[int] = None
    h_index: Optional[int] = None
    normalized_h_index: Optional[int] = None

    def to_dict(self):
        return {
            'orcid_id': self.orcid_id,
            'author_name': self.author_name,
            'biography': self.biography,
            'author_keywords': self.author_keywords,
            'academic_age': self.academic_age,
            'total_citations': self.total_citations,
            'total_unique_social_media_mentions': self.total_unique_social_media_mentions,
            'total_neppr': self.total_neppr,
            'h_index': self.h_index,
            'normalized_h_index': self.normalized_h_index
        }


author = AuthorInfo(
    orcid_id='0000-0002-1825-0097',
)

author.total_unique_social_media_mentions = 20

print(json.dumps(vars(author)))