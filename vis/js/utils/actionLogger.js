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
      return trackMatomoEvent("Application", "Load");
    case "RESIZE":
      return trackMatomoEvent("Application", "Resize window");
    case "SEARCH":
      // TODO trackSiteSearch ?
      // https://developer.matomo.org/guides/tracking-javascript-guide
      return trackMatomoEvent("List controls", "Search", "Search box");
    default:
      return;
  }
};

export default logAction;
