import React from "react";
import Highlight from "../components/Highlight";

const Paper = ({ data, readersLabel, zoom }) => {
  const { title, authors, year, num_readers: readers } = data;
  const { oa: isOpenAccess, free_access: isFreeAccess, resulttype } = data;
  const { x, y, width, height } = getCoordinatesAndDimensions(data, zoom);

  const paperPath = getPath({ x, y, width, height });
  const dogearPath = getDogEar({ x, y, width, height });

  return (
    // html template starts here
    <g className="paper">
      <path
        id="region"
        d={paperPath}
        className={"unframed" + (zoom ? " zoomed_in" : "")}
        style={{ fillOpacity: 1 }}
      ></path>
      <path className="dogear" d={dogearPath}></path>
      <foreignObject
        id="article_metadata"
        x={x}
        y={y}
        width={width}
        height={height}
      >
        <div>
          <div className={"paper_holder" + (zoom ? " zoomed_in" : "")}>
            <div
              className="metadata"
              style={{ height: 0.75 * height, width: 0.9 * width }}
            >
              <div id="icons">
                {isOpenAccess && <p id="open-access-logo">&#61596;</p>}
                {resulttype === "dataset" && (
                  <p id="dataset-icon">
                    <span
                      id="dataset-icon_list"
                      className="fa fa-database"
                    ></span>
                  </p>
                )}
                {isFreeAccess && <p id="free-access-logo">&#61596;</p>}
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
                  <span id="num-readers">{readers} </span>
                  <span className="readers_entity">{readersLabel}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
    // html template ends here
  );
};

export default Paper;

const getDogEar = ({ x, y, width: w, height: h }) => {
  return `M ${x + 0.9 * w} ${y} v ${0.1 * h} h ${0.1 * w}`;
};

const getPath = ({ x, y, width: w, height: h }) => {
  return `M ${x} ${y} h ${0.9 * w} l ${0.1 * w} ${0.1 * h} v ${
    0.9 * h
  } h ${-w} v ${-h}`;
};

const getCoordinatesAndDimensions = (data, zoom) => {
  const {
    x,
    y,
    width,
    height,
    zoomedX,
    zoomedY,
    zoomedWidth,
    zoomedHeight,
  } = data;
  if (zoom) {
    return { x: zoomedX, y: zoomedY, width: zoomedWidth, height: zoomedHeight };
  }

  return { x, y, width, height };
};
