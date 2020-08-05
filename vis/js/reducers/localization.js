const localization = (state = {}, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return Object.assign({}, action.configObject.localization[action.configObject.language]);
    default:
      return state;
  }
};

export default localization;
