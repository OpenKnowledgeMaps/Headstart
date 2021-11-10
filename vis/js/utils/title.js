/**
 * Sets correct page title based on the current action and state.
 *
 * @param {Object} action the Redux action object
 * @param {string} defaultTitle the original page title Headstart has when it loads
 * @param {Object} state the Redux state object
 */
export const handleTitleAction = (action, defaultTitle, state) => {
  switch (action.type) {
    case "ZOOM_IN":
      document.title = getZoomInTitle(
        action.selectedAreaData,
        action.selectedPaperData,
        defaultTitle
      );
      return;
    case "ZOOM_OUT":
      document.title = defaultTitle;
      return;
    case "SELECT_PAPER":
      document.title = getSelectPaperTitle(action.paper, defaultTitle);
      return;
    case "DESELECT_PAPER":
      document.title = getDeselectPaperTitle(defaultTitle, state);
      return;
    default:
      return;
  }
};

const getZoomInTitle = (areaData, paperData, defaultTitle) => {
  if (!areaData) {
    return document.title;
  }

  if (paperData) {
    return `${paperData.title} | ${defaultTitle}`;
  }

  return `${areaData.title} | ${defaultTitle}`;
};

const getSelectPaperTitle = (paperData, defaultTitle) => {
  if (!paperData) {
    return document.title;
  }

  return `${paperData.title} | ${defaultTitle}`;
};

const getDeselectPaperTitle = (defaultTitle, state) => {
  if (state.selectedBubble) {
    return getZoomInTitle(
      { title: state.selectedBubble.title },
      null,
      defaultTitle
    );
  }

  return defaultTitle;
};
