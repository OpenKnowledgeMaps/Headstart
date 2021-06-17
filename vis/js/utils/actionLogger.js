/**
 * If the action has to be logged, it logs it.
 *
 * @param {object} action redux action object
 * @param {object} state redux state
 * @param {Function} callback intermediate layer logger function
 * @param {object} params config params
 */
const logAction = (action, state, callback, params) => {
  switch (action.type) {
    case "ZOOM_IN":
      return callback(
        action.selectedAreaData.title,
        "Bubble",
        "zoomin",
        "none"
      );
    case "ZOOM_OUT":
      return callback(
        state.selectedBubble ? state.selectedBubble.title : "none",
        "Bubble",
        "zoomout",
        "none"
      );
    case "HOVER_BUBBLE":
      if (params.mouseoverEvaluation) {
        callback(
          action.uri ? action.uri : state.bubbleOrder.hoveredBubble,
          "Bubble",
          action.uri ? "mouseover" : "mouseout",
          "none"
        );
      }
      break;
    case "RESIZE":
      return callback(params.title, "Map", "resize", "resize_map");
    case "SHOW_LIST":
      return callback(params.title, "List", "show", "none");
    case "TOGGLE_LIST":
      return callback(
        params.title,
        "List",
        state.list.show ? "hide" : "show",
        "none"
      );
    case "SORT":
      return callback(
        params.localization[action.id],
        "List",
        "sortBy",
        "listsort",
        null,
        "sort_option=" + action.id
      );
    case "SEARCH":
      return callback(
        action.text,
        "List",
        "search",
        "filter_list",
        null,
        "search_words=" + action.text
      );
    case "FILTER":
      return callback(
        params.localization[action.id],
        "List",
        "filter",
        "filter_list",
        null,
        "filter_param=" + action.id
      );
    case "HOVER_PAPER": {
      if (!params.mouseoverEvaluation) {
        return;
      }
      if (!action.safeId) {
        return;
      }
      const paper = state.data.list.find((p) => p.safe_id === action.safeId);
      return callback(
        paper.title,
        "Paper",
        "enlarge",
        paper.bookmarked + " " + paper.recommended
      );
    }
    case "SELECT_PAPER": {
      const paper = action.paper;
      return callback(
        paper.title,
        "Paper",
        "select",
        paper.bookmarked + " " + paper.recommended
      );
    }
    case "DESELECT_PAPER": {
      if (!state.selectedPaper || !state.selectedPaper.safeId) {
        return;
      }
      const paper = state.data.list.find(
        (p) => p.safe_id === state.selectedPaper.safeId
      );
      if (!paper) {
        return;
      }
      return callback(
        paper.title,
        "Paper",
        "unselect",
        paper.bookmarked + " " + paper.recommended
      );
    }
    case "INITIALIZE":
      return callback(params.title, "Map", "start", "start_bubble");
    case "OPEN_INFO_MODAL":
      return callback(
        params.title,
        "Map",
        "open_info_modal",
        "open_info_modal"
      );
    case "OPEN_EMBED_MODAL":
      return callback(
        params.title,
        "Map",
        "open_embed_modal",
        "open_embed_modal"
      );
    case "SCALE":
      return callback(
        params.scaleLabel[action.value],
        "Toolbar",
        "select",
        "toolbar_select"
      );
    default:
      return;
  }
};

export default logAction;
