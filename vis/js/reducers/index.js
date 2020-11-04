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
});
