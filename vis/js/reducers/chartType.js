const chartType = (state = "normal", action) => {
  switch (action.type) {
    case "SET_NORMAL":
      return "normal";
    case "SET_STREAMGRAPH":
      return "streamgraph";
    default:
      return state;
  }
};

export default chartType;
