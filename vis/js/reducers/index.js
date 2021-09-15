/**
 * The main reducer where all subreducers are combined into one.
 */
import { combineReducers } from "redux";

import animation from "./animation";
import areas from "./areas";
import bubbleOrder from "./bubbleOrder";
import chart from "./chart";
import chartType from "./chartType";
import contextLine from "./contextLine";
import data from "./data";
import files from "./files";
import heading from "./heading";
import highlightedBubble from "./highlightedBubble";
import hyphenationLang from "./hyphenationLang";
import isCovis from "./isCovis";
import list from "./list";
import localization from "./localization";
import misc from "./misc";
import modals from "./modals";
import paperOrder from "./paperOrder";
import previewModal from "./previewModal";
import query from "./query";
import selectedBubble from "./selectedBubble";
import selectedPaper from "./selectedPaper";
import service from "./service";
import streamgraph from "./streamgraph";
import timespan from "./timespan";
import toolbar from "./toolbar";
import zoom from "./zoom";

export default combineReducers({
  animation,
  areas,
  bubbleOrder,
  chart,
  chartType,
  contextLine,
  data,
  files,
  heading,
  highlightedBubble,
  hyphenationLang,
  isCovis,
  list,
  localization,
  misc,
  modals,
  paperOrder,
  previewModal,
  query,
  selectedBubble,
  selectedPaper,
  service,
  streamgraph,
  timespan,
  toolbar,
  zoom,
});
