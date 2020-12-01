import React from "react";
import Highlight from "../components/Highlight";

const Paper = ({
  title,
  authors,
  year,
  readers,
  readersLabel,
  x,
  y,
  width,
  height,
  paperPath,
  dogearPath,
}) => {
  return (
    // html template starts here
    <g className="paper">
      <path
        id="region"
        d={paperPath}
        className="unframed zoomed_in"
        style={{fillOpacity: 1}}
      ></path>
      <path className="dogear" d={dogearPath}></path>
      <foreignObject
        id="article_metadata"
        x={x}
        y={y}
        width={width}
        height={height}
      >
        <body>
          <div className="paper_holder">
            <div
              className="metadata"
              style={{ height: 0.75 * height, width: 0.9 * width }}
            >
              <div id="icons">
                <p id="open-access-logo"></p>
                <p id="dataset-icon">
                  <span
                    id="dataset-icon_list"
                    className="fa fa-database"
                  ></span>
                </p>
                <p id="free-access-logo"></p>
              </div>
              <p id="paper_visual_distributions"></p>
              <p id="title">
                <Highlight>{title}</Highlight>
              </p>
              <p id="details">
                <Highlight>{authors}</Highlight>
              </p>
              <p id="in">
                <span className="pubyear">
                  <Highlight>{year}</Highlight>
                </span>
              </p>
            </div>
            {typeof readers !== "undefined" && readers !== null && (
              <div className="readers">
                <p id="readers">
                  <span id="num-readers">{readers}</span>
                  <span className="readers_entity">{readersLabel}</span>
                </p>
              </div>
            )}
          </div>
        </body>
      </foreignObject>
    </g>
    // html template ends here
  );
};

export default Paper;
