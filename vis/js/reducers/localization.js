const localization = (state = {}, action) => {
  if (action.canceled) {
    return state;
  }
  
  switch (action.type) {
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
