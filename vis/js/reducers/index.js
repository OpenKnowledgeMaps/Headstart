/**
 * The main reducer where all subreducers are combined into one.
 */
import { combineReducers } from "redux";
import zoom from "./zoom";

export default combineReducers({
  zoom,
});
