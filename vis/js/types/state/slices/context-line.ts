import { ServiceType } from "../../visualization/service";

export interface ContextLine {
  articlesCount: number;
  author: ContextLineAuthorData;
  contentProvider: undefined;
  dataSource: string;
  datasetCount: null;
  documentLang: string[];
  documentTypes: string[];
  excludeDateFilters: null;
  funder: null;
  isResearcherDetailsEnabled: unknown;
  isResearcherMetricsEnabled: unknown;
  legacySearchLanguage: null;
  metadataQuality: string;
  modifier: string;
  modifierLimit: number;
  openAccessCount: null;
  paperCount: null;
  projectRuntime: null;
  searchLanguage: null;
  service: ServiceType;
  show: boolean;
  showAuthor: boolean;
  showDataSource: boolean;
  showLanguage: boolean;
  show_h_index: boolean;
  timestamp: null;
}

interface ContextLineAuthorData {
  id: null;
  imageLink: null;
  livingDates: null;
}
