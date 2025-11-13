import { Action, VisualizationTypes } from "../types";

export const STREAMGRAPH_MODE = "timeline";
export const KNOWLEDGEMAP_MODE = "overview";
export const GEOMAP_MODE = "geomap";
const WARNINGS = {
  undefined:
    "Chart type is not defined in the configuration. The overview one will be used as a fallback.",
  notAllowed:
    "Configured chart type is not allowed. The overview one will be used as a fallback.",
};

type ChartTypeReducer = (
  prevState: VisualizationTypes | undefined,
  action: Action,
) => VisualizationTypes;

export const chartType: ChartTypeReducer = (prevState, action) => {
  const state = prevState ?? KNOWLEDGEMAP_MODE;

  switch (action.type) {
    case "INITIALIZE": {
      const type = action.configObject?.visualization_type;

      if (!type) {
        console.warn(WARNINGS.undefined);
        return KNOWLEDGEMAP_MODE;
      }

      if (![STREAMGRAPH_MODE, KNOWLEDGEMAP_MODE, GEOMAP_MODE].includes(type)) {
        console.warn(WARNINGS.notAllowed);
        return KNOWLEDGEMAP_MODE;
      }

      return type;
    }
    default: {
      return state;
    }
  }
};
