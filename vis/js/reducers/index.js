/**
 * The main reducer where all subreducers are combined into one.
 */
import { combineReducers } from "redux";

import animation from "./animation";
import areas from "./areas";
import author from "./author";
import bubbleOrder from "./bubbleOrder";
import chart from "./chart";
import chartType from "./chartType";
import contextLine from "./contextLine";
import data from "./data";
import heading from "./heading";
import highlightedBubble from "./highlightedBubble";
import hyphenationLang from "./hyphenationLang";
import isCovis from "./isCovis";
import list from "./list";
import localization from "./localization";
import misc from "./misc";
import modals from "./modals";
import paperOrder from "./paperOrder";
import query from "./query";
import selectedBubble from "./selectedBubble";
import selectedPaper from "./selectedPaper";
import service from "./service";
import streamgraph from "./streamgraph";
import timespan from "./timespan";
import toolbar from "./toolbar";
import tracking from "./tracking";
import zoom from "./zoom";
import q_advanced from "./q_advanced";
import modalInfoType from "./modalInfoType";
import paper from "./paper";

export default combineReducers({
  animation,
  areas,
  author,
  bubbleOrder,
  chart,
  chartType,
  contextLine,
  data,
  heading,
  highlightedBubble,
  hyphenationLang,
  isCovis,
  list,
  localization,
  misc,
  modals,
  paperOrder,
  query,
  selectedBubble,
  selectedPaper,
  service,
  paper,
  streamgraph,
  timespan,
  toolbar,
  tracking,
  zoom,
  q_advanced,
  modalInfoType,
});

export const getInitialState = (config) => {
  // TODO where possible, move the config values from INITIALIZE to here
  return {
    localization: {
      // TODO: right now eng localization is enabled by default
      ...config.localization.eng,
      ...config.localization[config.language],
    },
    misc: {
      isEmbedded: config.credit_embed,
      isLoading: true,
      showCreatedByViper: config.credit,
      showLoading: config.show_loading_screen,
      renderList: config.render_list,
      renderMap: config.render_map,
      timestamp: config.timestamp,
      visTag: config.tag,
    },
    modalInfoType: config.modal_info_type,
  };
};
