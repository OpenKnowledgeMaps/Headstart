const context = (state = {}, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return Object.assign({}, action.contextObject);
    default:
      return state;
  }
};

export default context;
