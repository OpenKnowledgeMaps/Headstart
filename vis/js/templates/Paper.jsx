import React, { useState, useRef } from "react";
import Highlight from "../components/Highlight";

const Paper = ({
  data,
  readersLabel,
  zoom,
  selected,
  onClick,
  onMouseOver,
}) => {
  const { title, authors_string: authors, year } = data;
  const { num_readers: readers, published_in: publisher } = data;
  const { oa: isOpenAccess, free_access: isFreeAccess, resulttype } = data;
  const {
    x,
    y,
    width: baseWidth,
    height: baseHeight,
  } = getCoordinatesAndDimensions(data, zoom);

  const [hovered, setHovered] = useState(false);
  const handleMouseOver = () => {
    if (!zoom) {
      return;
    }

    onMouseOver();
    setHovered(true);
  };

  const handleMouseOut = () => {
    setHovered(false);
  };

  const metadataRef = useRef(null);

  let width = baseWidth;
  let height = baseHeight;
  if (hovered) {
    const enlargeFactor = getEnlargeFactor(
      metadataRef.current.offsetWidth,
      metadataRef.current.scrollHeight
    );
    width *= enlargeFactor;
    height *= enlargeFactor;
  }

  const paperPath = getPath({ x, y, width, height });
  const dogearPath = getDogEar({ x, y, width, height });

  let pathClass = selected ? "framed" : "unframed";
  let paperClass = "paper_holder";
  let sizeModifierClass = "";
  if (zoom) {
    pathClass += " zoomed_in";
    paperClass += " zoomed_in";
    sizeModifierClass = "large";
  }
  if (hovered) {
    sizeModifierClass = "larger";
  }

  // TODO move everything into styles

  return (
    // html template starts here
    <g
      className="paper"
      onClick={!zoom || selected ? undefined : onClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <path
        id="region"
        d={paperPath}
        className={pathClass}
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
        <div style={{ width, height }}>
          <div className={paperClass}>
            <div
              className="metadata"
              style={{
                height: height - 22,
                width: (1 - DOGEAR_WIDTH) * width,
              }}
              ref={metadataRef}
            >
              <div id="icons">
                {isOpenAccess && (
                  <p id="open-access-logo" className={sizeModifierClass}>
                    &#61596;
                  </p>
                )}
                {resulttype === "dataset" && (
                  <p id="dataset-icon" className={sizeModifierClass}>
                    <span
                      id="dataset-icon_list"
                      className="fa fa-database"
                    ></span>
                  </p>
                )}
                {isFreeAccess && (
                  <p id="free-access-logo" className={sizeModifierClass}>
                    &#61596;
                  </p>
                )}
              </div>
              <p
                id="paper_visual_distributions"
                className={sizeModifierClass}
              ></p>
              <p id="title" className={sizeModifierClass}>
                <Highlight>{title}</Highlight>
              </p>
              <p id="details" className={sizeModifierClass}>
                <Highlight>{authors}</Highlight>
              </p>
              <p id="in" className={sizeModifierClass}>
                {publisher && (
                  <>
                    in <Highlight>{publisher}</Highlight>
                  </>
                )}
                <span className="pubyear">
                  {" "}
                  (<Highlight>{year}</Highlight>)
                </span>
              </p>
            </div>
            {typeof readers !== "undefined" && readers !== null && (
              <div className="readers">
                <p id="readers" className={sizeModifierClass}>
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

// config.dogear_width
const DOGEAR_WIDTH = 0.1;
// config.dogear_height
const DOGEAR_HEIGHT = 0.1;

const getDogEar = ({ x, y, width: w, height: h }) => {
  return `M ${x + (1 - DOGEAR_WIDTH) * w} ${y} v ${DOGEAR_HEIGHT * h} h ${
    DOGEAR_WIDTH * w
  }`;
};

const getPath = ({ x, y, width: w, height: h }) => {
  return `M ${x} ${y} h ${(1 - DOGEAR_WIDTH) * w} l ${DOGEAR_HEIGHT * w} ${
    DOGEAR_WIDTH * h
  } v ${(1 - DOGEAR_HEIGHT) * h} h ${-w} v ${-h}`;
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

const getEnlargeFactor = (offsetWidth, scrollHeight) => {
  // config.paper_width_factor
  const PAPER_WIDTH_FACTOR = 1.2;
  // config.paper_height_factor
  const PAPER_HEIGHT_FACTOR = 1.6;
  const oldRatio = PAPER_WIDTH_FACTOR / PAPER_HEIGHT_FACTOR;
  let newWidth = offsetWidth;
  let newRatio = scrollHeight / newWidth;

  while (newRatio.toFixed(1) > oldRatio.toFixed(1)) {
    scrollHeight -= Math.pow(PAPER_HEIGHT_FACTOR, 3);
    newWidth += Math.pow(PAPER_WIDTH_FACTOR, 3);
    newRatio = scrollHeight / newWidth;
  }

  return (newWidth / offsetWidth) * (1.0 / (1 - DOGEAR_WIDTH));
};
