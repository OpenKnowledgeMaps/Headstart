import { ServiceType } from "../../visualization/service";

export interface Modals {
  FAQsUrl: string;
  FAQsUrlStr: string;
  apiProperties: ApiProperties;
  citedPaper: null;
  exportedPaper: null;
  infoParams: InfoParams;
  openCitationModal: boolean;
  openEmbedModal: boolean;
  openInfoModal: boolean;
  openResearcherMetricsModal: boolean;
  openResearcherModal: boolean;
  previewedPaper: null;
  reloadLastUpdate: unknown;
  showCitationButton: boolean;
  showEmailButton: boolean;
  showEmbedButton: boolean;
  showFAQsButton: boolean;
  showPDFPreview: boolean;
  showReloadButton: boolean;
  showShareButton: boolean;
  showTwitterButton: boolean;
  twitterHashtags: string;
  useViewer: boolean;
}

interface ApiProperties {
  headstartPath: string;
  persistenceBackend: unknown;
  sheetID: null;
}

interface InfoParams {
  id: string;
  query: string;
  service: ServiceType;
  timestamp: string;
  from: string;
  to: string;
  document_types: string[];
  sorting: string;
  min_descsize: string;
  params: unknown;
  lang_id: string[];
}
