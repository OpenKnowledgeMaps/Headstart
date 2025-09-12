interface Websites {
  url: string;
  "url-name": string;
}

interface ResearcherURL {
  id: string;
  url: string;
  url_name: string;
}

interface Employment {
  department: unknown;
  end_date: string;
  id: string;
  organization: string;
  organization_address: string;
  role: string;
  start_date: string;
}

interface Education {
  department: string;
  end_date: string;
  id: string;
  organization: string;
  organization_address: string;
  role: string;
  start_date: string;
  url: string;
}

export interface Author {
  author_keywords: string;
  author_name: string;
  biography: string;
  external_identifiers: unknown;
  researcher_urls: ResearcherURL[];
  orcid_id: string;
  total_citations: number;
  total_neppr: number;
  total_unique_social_media_mentions: number;
  websites: Websites[];
  h_index: number;
  academic_age: number;
  normalized_h_index: number;
  employment: Employment;
  employments: Employment[];
  funds: unknown[];
  educations: Education[];
  memberships: unknown[];
  distinctions: unknown[];
  services: unknown[];
  enable_teaching_mentorship: boolean;
  total_supervised_bachelor_students: number;
  total_supervised_master_students: number;
  total_supervised_phd_students: number;
}
