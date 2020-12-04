import React, {useState} from "react";
import Highlight from "../components/Highlight";

const Paper = ({
  data,
  readersLabel,
  zoom,
  selected,
  onClick,
  onMouseOver,
}) => {
  const { title, authors, year, num_readers: readers } = data;
  const { oa: isOpenAccess, free_access: isFreeAccess, resulttype } = data;
  const { x, y, width: baseWidth, height: baseHeight } = getCoordinatesAndDimensions(data, zoom);

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
  }

  let width = baseWidth;
  let height = baseHeight;
  if (hovered) {
    // TODO
    width *= 2;
    height *= 2;
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
        <div>
          <div className={paperClass}>
            <div
              className="metadata"
              style={{ height: 0.75 * height, width: 0.9 * width }}
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
                <span className="pubyear">
                  <Highlight>{year}</Highlight>
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
