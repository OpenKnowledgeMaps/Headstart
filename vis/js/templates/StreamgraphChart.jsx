import React from "react";

import { CHART_MARGIN } from "../utils/streamgraph";

const StreamgraphChart = ({ width, height }) => {
  return (
    // html template starts here
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
    // html template ends here
  );
};

export default StreamgraphChart;
