export type NotAvailable = "n/a";

export interface GeographicalData {
  continent: string | null;
  country: string | null;
  east: number | null;
  north: number | null;
}

export interface CommonPaperDataForAllIntegrations {
  id: string;
  doi: string;
  safe_id: string;
  identifier: string;

  title: string;
  keywords: string;
  cluster_labels: string;
  paper_abstract: string;
  labels: string;
  source: string;
  relation: string;

  comments: string[];
  comments_for_filtering: string;

  citation_count: NotAvailable | number;
  tags: string[];
  social: number | NotAvailable;
  references: null;
  citations: number | null;
  readers: number | NotAvailable;
  num_readers: number | NotAvailable;
  internal_readers: number;

  published_in: string;
  year: string;

  authors_list: string[];
  authors: string;
  authors_string: string;

  subject_orig: string;

  area: string;
  area_uri: number;

  oa: boolean;
  oa_state: number | string;

  url: string;
  outlink: string;
  list_link: {
    address: string;
    isDoi: boolean;
  };

  file_hash: string;
  free_access: boolean;
  resulttype: string[];

  x: number;
  y: number;
  diameter: number;
  width: number;
  height: number;
  zoomedX: number;
  zoomedY: number;
  zoomedWidth: number;
  zoomedHeight: number;
}

export interface PubmedPaper extends CommonPaperDataForAllIntegrations {
  pmid: string;
  pmcid: string;
  content: string;
  date: string;
  publication_type: string;
  oa_link: string;
  subject: string;
  authors_objects: {
    firstName: string;
    lastName: string;
  }[];
}

export interface BasePaper extends CommonPaperDataForAllIntegrations {
  authors_objects: { lastName: string; firstName?: string }[];
  link: string;
  relevance: number;
  type: string;
  typenorm: string;
  lang: string;
  language: string;
  content_provider: string;
  coverage: string;
  is_duplicate: boolean;
  has_dataset: boolean;
  sanitized_authors: string;
  oa_link: string;
  subject: string;
  relations: string[];
  annotations: {};
  repo: string;
  volume: null | string;
  issue: null | string;
  issn: null | string;
  page: null | number;
}

export interface OrcidPaper extends CommonPaperDataForAllIntegrations {
  subtitle: string | null;
  tweets: number;
  authors_objects: { lastName: string; firstName?: string }[];
  publication_year: number;
  cited_by_msm_count: number | string | null;
  cited_by_fbwalls_count: number | string | null;
  cited_by_tweeters_count: number | string | null;
  cited_by_feeds_count: number | string | null;
  cited_by_gplus_count: number | string | null;
  cited_by_rdts_count: number | string | null;
  cited_by_wikipedia_count: number | string | null;
  cited_by_qna_count: number | string | null;
}

export interface AquanaviPaper extends CommonPaperDataForAllIntegrations {
  coverage: string;
  geographicalData: GeographicalData | null;
}

export type AllPossiblePapersType =
  | BasePaper
  | PubmedPaper
  | OrcidPaper
  | AquanaviPaper;

export interface Paper {
  id: string;
  safe_id: string;
  oa_link: string;
  link: string;
  identifier: string;
  relation: string;
  outlink: string;
  fulltext: string;
  list_link: any;

  title: string;
  authors_objects: {
    firstName: string;
    lastName: string;
  }[];
  year: string;
  source: string;
  volume: number;
  issue: number;
  page: number;
  issn: number;

  resulttype: string[];

  x?: number;
  y?: number;

  width?: number;
  height?: number;

  area_uri: string;
  area: string;

  free_access: boolean;
  oa: boolean;

  // data from backend
  cited_by_fbwalls_count?: number;
  cited_by_feeds_count?: number;
  cited_by_gplus_count?: number;
  cited_by_rdts_count?: number;
  cited_by_qna_count?: number;
  cited_by_tweeters_count?: number;
  cited_by_videos_count?: number;

  // data manager
  // calculated values
  social?: string | number;
}
