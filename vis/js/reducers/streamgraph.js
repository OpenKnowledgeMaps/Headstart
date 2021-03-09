const streamgraph = (state = { data: "", colors: [], visTag: "" }, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        data: action.streamData,
        colors: action.configObject.streamgraph_colors,
        visTag: action.configObject.tag,
      };
    default:
      return state;
  }
};

export default streamgraph;
