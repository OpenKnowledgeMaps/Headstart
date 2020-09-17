const query = (state = null, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return typeof action.contextObject.query !== "undefined"
        ? action.contextObject.query
        : null;
    default:
      return state;
  }
};

export default query;
