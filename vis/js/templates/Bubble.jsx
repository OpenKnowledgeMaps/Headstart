import React from "react";
import Highlight from "../components/Highlight";

import Paper from "./Paper";

const Bubble = ({
  data,
  eventHandlers,
  papers,
  hovered,
  zoomed,
  zoom,
  baseUnit,
}) => {
  const sqrtOfTwo = Math.sqrt(2);

  const { title } = data;
  const { x, y, r } = getCoordinates(data, zoom);

  const width = (2 * r) / sqrtOfTwo;
  const height = width;

  // TODO move the inline styles into css
  const areaTitleStyle = {
    wordWrap: "break-word",
    fontSize: "12px",
    width,
    height,
  };

  // TODO add classes representing the state

  // TODO states
  // zoomedOut
  // framed
  // hovered
  // zoomedIn
  // gray

  const circleStyle = { fillOpacity: 0.9 };
  let circleClass = "";
  if (zoomed) {
    circleClass = " zoom_selected";
  }
  if (hovered || zoomed) {
    circleStyle.fillOpacity = 1;
  }
  if (zoom && !zoomed) {
    circleStyle.fillOpacity = 0.1;
    circleClass = " zoom_unselected";
  }

  const renderPaper = (paper) => (
    <Paper
      key={paper.safe_id}
      data={paper}
      readersLabel={baseUnit}
      zoom={zoom}
    />
  );

  return (
    // html template starts here
    <g className="bubble_frame" {...eventHandlers}>
      {!hovered && !zoomed && papers.map(renderPaper)}
      <circle
        className={"area" + circleClass}
        r={r}
        cx={x}
        cy={y}
        style={circleStyle}
      >
        <title>{title}</title>
      </circle>
      <foreignObject
        id="area_title_object"
        className="headstart"
        x={x - r / sqrtOfTwo}
        y={y - r / sqrtOfTwo}
        width={width}
        height={height}
        style={{ cursor: !zoomed ? "zoom-in" : undefined }}
      >
        <div>
          {!hovered && !zoom && (
            <div id="area_title" style={areaTitleStyle}>
              <p id="area_visual_distributions"></p>
              <h2 style={{ fontSize: 14 }}>
                <Highlight>{title}</Highlight>
              </h2>
            </div>
          )}
        </div>
      </foreignObject>
      {(hovered || zoomed) && papers.map(renderPaper)}
    </g>
    // html template ends here
  );
};

export default Bubble;

const getCoordinates = (data, zoom) => {
  const { x, y, r, zoomedX, zoomedY, zoomedR } = data;
  if (zoom) {
    return { x: zoomedX, y: zoomedY, r: zoomedR };
  }

  return { x, y, r };
};
