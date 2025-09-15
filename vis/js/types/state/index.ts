import { Localization } from "../../i18n/localization";
import { Author } from "../models/author";
import { ServiceType } from "../visualization/service";
import * as slices from "./slices";

export interface State {
  animation: null;
  areas: slices.Areas;
  author: Author;
  bubbleOrder: slices.BubbleOrder;
  chart: slices.Chart;
  chartType: "knowledgeMap" | "streamgraph";
  contextLine: slices.ContextLine;
  data: slices.Data;
  heading: slices.Heading;
  highlightedBubble: null;
  hyphenationLang: "en";
  isCovis: boolean;
  list: slices.List;
  localization: Localization;
  misc: slices.Misc;
  modalInfoType: slices.ModalInfoType;
  modals: slices.Modals;
  paper: slices.Paper;
  paperOrder: slices.PaperOrder;
  q_advanced: slices.QueryAdvanced;
  query: slices.Query;
  selectedBubble: slices.SelectedBubble;
  selectedPaper: null;
  service: ServiceType;
  streamgraph: slices.Streamgraph;
  timespan: string;
  toolbar: slices.Toolbar;
  tracking: slices.Tracking;
  zoom: true;
}
