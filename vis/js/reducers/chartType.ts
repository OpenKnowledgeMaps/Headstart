import { VisualizationTypes } from "../types";

export const STREAMGRAPH_MODE = "timeline";
export const KNOWLEDGEMAP_MODE = "overview";
export const GEOMAP_MODE = "geomap";

const chartType = (
  state: VisualizationTypes = KNOWLEDGEMAP_MODE,
  action: any,
) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE":
      const isStreamgraph: boolean = action.configObject.is_streamgraph;
      const type: VisualizationTypes = action.configObject.visualization_type;

      if (isStreamgraph) {
        return STREAMGRAPH_MODE;
      }

      switch (type) {
        case KNOWLEDGEMAP_MODE:
          return KNOWLEDGEMAP_MODE;
        case STREAMGRAPH_MODE:
          return STREAMGRAPH_MODE;
        case GEOMAP_MODE:
          return GEOMAP_MODE;
        default:
          KNOWLEDGEMAP_MODE;
      }
    default:
      return state;
  }
};

export default chartType;
