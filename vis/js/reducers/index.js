/**
 * The main reducer where all subreducers are combined into one.
 */
import { combineReducers } from "redux";
import backlink from "./backlink";

export default combineReducers({
  backlink,
});
