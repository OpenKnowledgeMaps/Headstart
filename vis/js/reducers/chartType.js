export const STREAMGRAPH_MODE = "streamgraph";
export const KNOWLEDGEMAP_MODE = "knowledgeMap";

const chartType = (state = KNOWLEDGEMAP_MODE, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return action.configObject.is_streamgraph
        ? STREAMGRAPH_MODE
        : KNOWLEDGEMAP_MODE;
    default:
      return state;
  }
};

export default chartType;
