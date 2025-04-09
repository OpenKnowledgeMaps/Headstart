import React from "react";

import { CHART_MARGIN } from "../utils/streamgraph";

export interface StreamgraphChartProps {
  width: number;
  height: number;
}

const StreamgraphChart = ({ width, height }: StreamgraphChartProps) => {
  return (
    <div id="headstart-chart">
      <svg
        width={width}
        height={height}
        id="streamgraph_subject"
        className="streamgraph-canvas"
      >
        <g
          id="streamgraph-chart"
          className="streamgraph-chart"
          transform={`translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`}
        ></g>
      </svg>
    </div>
  );
};

export default StreamgraphChart;
