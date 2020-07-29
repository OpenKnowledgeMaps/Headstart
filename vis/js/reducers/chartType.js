const chartType = (state = "knowledgeMap", action) => {
  switch (action.type) {
    case "SET_KNOWLEDGE_MAP":
      return "knowledgeMap";
    case "SET_STREAMGRAPH":
      return "streamgraph";
    default:
      return state;
  }
};

export default chartType;
