/**
 * The main reducer where all subreducers are combined into one.
 */
import { combineReducers } from "redux";
import zoom from "./zoom";
import chartType from "./chartType";
import config from "./config";
import context from "./context";
import selectedBubble from "./selectedBubble";

export default combineReducers({
  zoom,
  chartType,
  config,
  context,
  selectedBubble
});
