import { trackMatomoEvent } from "./useMatomo";

/**
 * Matomo logging function for events that depend purely on the state change.
 *
 * Events that are triggered by a user click are logged right in the components.
 *
 * @param {object} action redux action object
 * @param {object} state redux state object
 */
const logAction = (action, state) => {
  switch (action.type) {
    case "INITIALIZE":
      return trackMatomoEvent("Headstart", "Load");
    case "RESIZE":
      return trackMatomoEvent("Headstart", "Resize window");
    case "SEARCH":
      // TODO trackSiteSearch ?
      // https://developer.matomo.org/guides/tracking-javascript-guide
      return trackMatomoEvent("List controls", "Search", "Search box");
    case "ZOOM_IN":
      return trackZoomIn(action, state);
    case "ZOOM_OUT":
      return trackZoomOut(action);
    case "SELECT_PAPER":
      return trackSelectPaper(action);
    case "DESELECT_PAPER":
      return trackDeselectPaper(action);
    default:
      return;
  }
};

export default logAction;

const trackZoomIn = (action, state) => {
  if (!action.isFromBackButton) {
    return;
  }

  if (action.selectedPaperData) {
    return trackSelectPaper(action);
  }

  if (state.selectedPaper) {
    return trackDeselectPaper(action);
  }

  trackMatomoEvent("Browser buttons", "Zoom in", "Back/Forward button");
};

const trackZoomOut = (action) => {
  if (action.isFromBackButton) {
    trackMatomoEvent("Browser buttons", "Zoom out", "Back/Forward button");
  }
};

const trackSelectPaper = (action) => {
  if (action.isFromBackButton) {
    trackMatomoEvent("Browser buttons", "Select paper", "Back/Forward button");
  }
};

const trackDeselectPaper = (action) => {
  if (action.isFromBackButton) {
    trackMatomoEvent(
      "Browser buttons",
      "Deselect paper",
      "Back/Forward button"
    );
  }
};
