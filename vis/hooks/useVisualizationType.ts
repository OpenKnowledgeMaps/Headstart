/**
 * The hook allows to access a visualization type and useful boolean flags.
 */

import { useSelector } from "react-redux";

import {
  GEOMAP_MODE,
  KNOWLEDGEMAP_MODE,
  STREAMGRAPH_MODE,
} from "@/js/reducers/chartType";
import { State } from "@/js/types";

const gerVisualizationType = (state: State) => state.chartType;

export const useVisualizationType = () => {
  const visualizationType = useSelector(gerVisualizationType);

  const isGeoMap = visualizationType === GEOMAP_MODE;
  const isStreamgraph = visualizationType === STREAMGRAPH_MODE;
  const isKnowledgeMap = visualizationType === KNOWLEDGEMAP_MODE;

  return { visualizationType, isGeoMap, isKnowledgeMap, isStreamgraph };
};
