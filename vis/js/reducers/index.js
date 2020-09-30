/**
 * The main reducer where all subreducers are combined into one.
 */
import { combineReducers } from "redux";
import zoom from "./zoom";
import chartType from "./chartType";
import localization from "./localization";
import heading from "./heading";
import selectedBubble from "./selectedBubble";
import query from "./query";
import files from "./files";
import contextLine from "./contextLine";
import service from "./service";

export default combineReducers({
  zoom,
  query,
  chartType,
  selectedBubble,
  heading,
  localization,
  files,
  contextLine,
  service,
});
