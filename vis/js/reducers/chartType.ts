export const STREAMGRAPH_MODE = "streamgraph";
export const KNOWLEDGEMAP_MODE = "knowledgeMap";

type ChartType = typeof STREAMGRAPH_MODE | typeof KNOWLEDGEMAP_MODE;

const chartType = (state: ChartType = KNOWLEDGEMAP_MODE, action: any) => {
  if (action.canceled) {
    return state;
  }
  
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
