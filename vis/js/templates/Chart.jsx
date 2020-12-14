import React from "react";

const Chart = ({ width, height, children, eventHandlers = {}, zoom }) => {
  return (
    // html template starts here
    // TODO move the div back here
    //<div id="headstart-chart" style={{ width }}>
    <svg id="chart-svg" width={width} height={height}>
      <g id="chart_canvas">
        <rect
          id="map-rect"
          className={zoom ? "zoomed_in" : "zoomed_out"}
          x={zoom ? -500 : 0}
          y={zoom ? -500 : 0}
          width={zoom ? width + 1000 : width}
          height={zoom ? height + 1000 : height}
          {...eventHandlers}
        ></rect>
        {children}
      </g>
    </svg>
    //</div>
    // html template ends here
  );
};

export default Chart;
