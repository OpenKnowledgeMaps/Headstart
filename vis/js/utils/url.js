/**
 * Adds a parameter into the URL query (without redirect).
 * @param {string} key parameter name
 * @param {string} value parameter value
 */
export const addQueryParam = (key, value) => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);

  window.history.pushState("", "", url.pathname + url.search);
};

/**
 * Removes a parameter from the URL query (without redirect).
 * @param {string} key parameter name
 */
export const removeQueryParams = (...keys) => {
  const url = new URL(window.location.href);
  keys.forEach((key) => {
    url.searchParams.delete(key);
  });

  window.history.pushState("", "", url.pathname + url.search);
};

const addRemoveQueryParams = (paramsToAdd, paramsToRemove) => {
  const url = new URL(window.location.href);

  Object.keys(paramsToAdd).forEach((key) => {
    url.searchParams.set(key, paramsToAdd[key]);
  });

  paramsToRemove.forEach((key) => {
    url.searchParams.delete(key);
  });

  window.history.pushState("", "", url.pathname + url.search);
};

//document.title = `${action.selectedAreaData.title} | ${itm.originalTitle}`;
//document.title = itm.originalTitle;

//document.title = `${action.paper.title} | ${itm.originalTitle}`;
//document.title = itm.originalTitle;

// TODO docs
export const handleReduxAction = (action) => {
  switch (action.type) {
    case "ZOOM_IN":
      return handleZoomIn(action);
    case "ZOOM_OUT":
      return handleZoomOut();
    case "SELECT_PAPER":
      return handleSelectPaper(action);
    case "DESELECT_PAPER":
      return handleDeselectPaper();
    default:
      return;
  }
};

const handleZoomIn = (action) => {
  if (!action.selectedAreaData) {
    return;
  }

  if (action.selectedPaperData) {
    addRemoveQueryParams(
      {
        area:
          typeof action.selectedAreaData.uri !== "undefined"
            ? action.selectedAreaData.uri
            : action.selectedAreaData.title,
        paper: action.selectedPaperData.safe_id,
      },
      []
    );

    return;
  }

  addRemoveQueryParams(
    {
      area:
        typeof action.selectedAreaData.uri !== "undefined"
          ? action.selectedAreaData.uri
          : action.selectedAreaData.title,
    },
    ["paper"]
  );
};

const handleZoomOut = () => removeQueryParams("area", "paper");

const handleSelectPaper = (action) => {
  if (!action.safeId) {
    return;
  }
  addQueryParam("paper", action.safeId);
};

const handleDeselectPaper = () => removeQueryParams("paper");
