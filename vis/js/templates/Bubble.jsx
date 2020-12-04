import React, {useState} from "react";
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
  selectedPaperId,
  handleSelectPaper,
}) => {
  const [paperOrder, setPaperOrder] = useState([]);
  const changePaperOrder = (paperId) => {
    const newPaperOrder = paperOrder.filter((id) => id !== paperId);
    newPaperOrder.push(paperId);
    setPaperOrder(newPaperOrder);
  };

  const sortedPapers = sortPapersByIds(papers, paperOrder);

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

  const renderPaper = (paper) => {
    const handlePaperClick = (event) => {
      // this is necessary so the paper is not deselected immediately with the
      // bubble click event
      event.stopPropagation();
      handleSelectPaper(paper);
    };

    const handlePaperMouseOver = () => {
      changePaperOrder(paper.safe_id);
    };

    return <Paper
      key={paper.safe_id}
      data={paper}
      readersLabel={baseUnit}
      zoom={zoom}
      selected={selectedPaperId === paper.safe_id}
      onClick={handlePaperClick}
      onMouseOver={handlePaperMouseOver}
    />
  };

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
      {(hovered || zoomed) && sortedPapers.map(renderPaper)}
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

const sortPapersByIds = (papers, ids) => {
  const newArray = [...papers];
  ids.forEach((id) => {
    const index = newArray.findIndex((e) => e.safe_id === id);
    newArray.push(newArray[index]);
    newArray.splice(index, 1);
  });

  return newArray;
};
