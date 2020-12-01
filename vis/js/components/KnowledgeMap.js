import React from "react";
import { connect } from "react-redux";

import LocalizationProvider from "./LocalizationProvider";

import { filterData } from "../utils/data";
import Bubble from "../templates/Bubble";
import Canvas from "../templates/Canvas";
import Paper from "../templates/Paper";

const KnowledgeMap = ({
  data,
  areas,
  searchSettings,
  filterSettings,
  localization,
  width,
  height,
}) => {
  let displayedData = filterData(data, searchSettings, filterSettings);
  return (
    <LocalizationProvider localization={localization}>
      <Canvas width={width} height={height}>
        {displayedData.map((paper) => (
          <Paper
            key={paper.safe_id}
            title={paper.title}
            authors={paper.authors_string}
            year={paper.year}
            readers={"TODO readers"}
            readersLabel={"TODO readers label"}
            x={paper.x}
            y={paper.y}
            width={paper.width}
            height={paper.height}
            paperPath={getPaperPath(paper)}
            dogearPath={getPaperDogEar(paper)}
          />
        ))}
        {areas.map((bubble) => (
          <Bubble
            key={bubble.area_uri}
            x={bubble.x}
            y={bubble.y}
            r={bubble.r}
            title={bubble.title}
            eventHandlers={{}}
          />
        ))}
      </Canvas>
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  data: state.data.list,
  areas: state.areas.list,
  searchSettings: {
    value: state.list.searchValue,
  },
  filterSettings: {
    value: state.list.filterValue,
    field: state.list.filterField,
    zoomed: state.zoom,
    area: state.selectedBubble ? state.selectedBubble.uri : null,
    paper: state.selectedPaper ? state.selectedPaper.safeId : null,
    isStreamgraph: false,
    title: state.selectedBubble ? state.selectedBubble.title : null,
  },
  localization: state.localization,
  width: state.chart.width,
  height: state.chart.height,
});

export default connect(mapStateToProps)(KnowledgeMap);

const getPaperDogEar = ({ x, y, width: w, height: h }) => {
  return "M " + (x + 0.9 * w) + " " + y + " v " + 0.1 * h + " h " + 0.1 * w;
};

const getPaperPath = ({ x, y, width: w, height: h }) => {
  const pathD =
    "M " +
    x +
    " " +
    y +
    " h " +
    0.9 * w +
    " l " +
    0.1 * w +
    " " +
    0.1 * h +
    " v " +
    0.9 * h +
    " h " +
    -w +
    " v " +
    -h;

  return pathD;
};
