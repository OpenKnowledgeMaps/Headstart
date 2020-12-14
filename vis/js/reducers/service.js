const service = (state = null, action) => {
  if (action.canceled) {
    return state;
  }
  
  switch (action.type) {
    case "INITIALIZE":
      return typeof action.contextObject.service !== "undefined"
        ? action.contextObject.service
        : null;
    default:
      return state;
  }
};

export default service;
