/**
 * The main reducer where all subreducers are combined into one.
 */
import { combineReducers } from "redux";
import zoom from "./zoom";
import chartType from "./chartType";
import localization from "./localization";
import heading from "./heading";
import selectedBubble from "./selectedBubble";
import selectedPaper from "./selectedPaper";
import query from "./query";
import files from "./files";
import contextLine from "./contextLine";
import service from "./service";
import list from "./list";
import data from "./data";
import previewModal from "./previewModal";
import areas from "./areas";
import chart from "./chart";
import animation from "./animation";
import highlightedBubble from "./highlightedBubble";
import bubbleOrder from "./bubbleOrder";
import paperOrder from "./paperOrder";
import hyphenationLang from "./hyphenationLang";
import modals from "./modals";
import toolbar from "./toolbar";
import misc from "./misc";
import streamgraph from "./streamgraph";
import isCovis from "./isCovis";

export default combineReducers({
  zoom,
  query,
  chartType,
  selectedBubble,
  selectedPaper,
  heading,
  localization,
  files,
  contextLine,
  service,
  list,
  data,
  previewModal,
  areas,
  chart,
  animation,
  highlightedBubble,
  bubbleOrder,
  paperOrder,
  hyphenationLang,
  modals,
  toolbar,
  misc,
  streamgraph,
  isCovis,
});
