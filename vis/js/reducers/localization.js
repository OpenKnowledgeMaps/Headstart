const localization = (state = {}, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "PREINITIALIZE":
      return Object.assign(
        {},
        action.configObject.localization[action.configObject.language]
      );
    case "INITIALIZE":
      return Object.assign(
        {},
        action.configObject.localization[action.configObject.language]
      );
    default:
      return state;
  }
};

export default localization;
