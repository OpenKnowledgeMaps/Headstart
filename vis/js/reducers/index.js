/**
 * The main reducer where all subreducers are combined into one.
 */
import { combineReducers } from "redux";
import zoom from "./zoom";
import chartType from "./chartType";

export default combineReducers({
  zoom,
  chartType,
});
