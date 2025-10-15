import { ReactNode } from "react";
import { VisualizationTypes } from "../types";
import * as chartType from "../reducers/chartType";
import Streamgraph from "../components/Streamgraph";
import KnowledgeMap from "../components/KnowledgeMap";
import React from "react";
import { Geomap } from "../templates/Geomap";

export const getVisualizationComponent = (
  type: VisualizationTypes,
): ReactNode => {
  switch (type) {
    case chartType.GEOMAP_MODE:
      return <Geomap />;
    case chartType.STREAMGRAPH_MODE:
      return <Streamgraph />;
    case chartType.KNOWLEDGEMAP_MODE:
      return <KnowledgeMap />;
    default:
      return <KnowledgeMap />;
  }
};
