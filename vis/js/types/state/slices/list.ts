export interface List {
  baseUnit: SortValuesType;
  citePapers: boolean;
  defaultSort: string;
  disableClicks: boolean;
  exportPapers: boolean;
  filterField: null;
  filterOptions: FilterValuesType[];
  filterValue: FilterValuesType;
  height: number;
  hideUnselectedKeywords: boolean;
  isContentBased: boolean;
  noCitationDoctypes: string[];
  searchValue: string;
  show: boolean;
  showDocumentType: boolean;
  showFilter: boolean;
  showKeywords: boolean;
  showMetrics: unknown;
  sortOptions: SortValuesType[];
  sortValue: SortValuesType;
}

export type FilterValuesType = "all" | "open_access" | "dataset";
export type SortValuesType = "relevance" | "title" | "authors" | "year";
