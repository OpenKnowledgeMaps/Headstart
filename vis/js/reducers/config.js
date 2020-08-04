const config = (state = {}, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return Object.assign({}, action.configObject);
    default:
      return state;
  }
};

export default config;
