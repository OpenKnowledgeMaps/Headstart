import React from "react";

const Canvas = ({ width, height, children }) => {
  return (
    // html template starts here
    // TODO move the div back here
    //<div id="headstart-chart" style={{ width }}>
      <svg id="chart-svg" width={width} height={height}>
        <g id="chart_canvas">
          <rect id="map-rect" width={width} height={height}></rect>
          {children}
        </g>
      </svg>
    //</div>
    // html template ends here
  );
};

export default Canvas;
