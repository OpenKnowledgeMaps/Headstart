import React from "react";
import Highlight from "../components/Highlight";

const Bubble = ({ x, y, r, title, eventHandlers }) => {
  const sqrtOfTwo = Math.sqrt(2);

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

  return (
    // html template starts here
    <g className="bubble_frame" {...eventHandlers}>
      <circle className="area" r={r} cx={x} cy={y} style={{ fillOpacity: 0.9 }}>
        <title>{title}</title>
      </circle>
      <foreignObject
        id="area_title_object"
        className="headstart"
        x={x - r / sqrtOfTwo}
        y={y - r / sqrtOfTwo}
        width={width}
        height={height}
      >
        <body>
          <div id="area_title" style={areaTitleStyle}>
            <p id="area_visual_distributions"></p>
            <h2 style={{ fontSize: 14 }}>
              <Highlight>{title}</Highlight>
            </h2>
          </div>
        </body>
      </foreignObject>
    </g>
    // html template ends here
  );
};

export default Bubble;
