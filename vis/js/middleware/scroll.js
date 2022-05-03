import $ from "jquery";

/**
 * Creates a middleware that scrolls to a previously selected paper
 * after a zoom out.
 */
const scrollMiddleware = ({ getState }) => {
  return (next) => (action) => {
    const selectedPaper = getState().selectedPaper;
    const returnValue = next(action);
    if (action.type === "ZOOM_OUT") {
      if (selectedPaper !== null) {
        scrollList(selectedPaper.safeId);
      } else {
        scrollList();
      }
    }

    if (action.type === "ZOOM_IN") {
      scrollList();
    }

    return returnValue;
  };
};

export default scrollMiddleware;

/**
 * Scrolls the list on the next animation frame.
 *
 * @param {String} safeId if specified, scrolls to that paper
 */
const scrollList = (safeId) => {
  requestAnimationFrame(() => {
    let scrollTop = 0;
    if (safeId) {
      scrollTop = $("#" + safeId).offset().top - $("#papers_list").offset().top;
    }
    $("#papers_list").animate({ scrollTop }, 0);
  });
};
