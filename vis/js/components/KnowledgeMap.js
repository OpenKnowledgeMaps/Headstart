import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import LocalizationProvider from "./LocalizationProvider";

import { filterData } from "../utils/data";
import Bubble from "../templates/Bubble";
import Canvas from "../templates/Canvas";

import { mapDispatchToMapEntriesProps } from "../utils/eventhandlers";

const KnowledgeMap = ({
  zoom,
  zoomedBubbleUri,
  data,
  areas,
  searchSettings,
  filterSettings,
  localization,
  width,
  height,
  baseUnit,
  handleZoomIn,
  handleZoomOut,
  handleDeselectPaper,
}) => {
  const [hoveredBubble, setHoveredBubble] = useState(null);
  const [bubbleOrder, setBubbleOrder] = useState([]);
  const changeBubbleOrder = (areaUri) => {
    const newBubbleOrder = bubbleOrder.filter((uri) => uri !== areaUri);
    newBubbleOrder.push(areaUri);
    setBubbleOrder(newBubbleOrder);
  };

  useEffect(() => {
    setHoveredBubble(zoomedBubbleUri);
    if (zoomedBubbleUri) {
      changeBubbleOrder(zoomedBubbleUri);
    }
  }, [zoomedBubbleUri]);

  const handleAreaMouseOver = (area) => {
    if (hoveredBubble === area.area_uri) {
      return;
    }

    setHoveredBubble(area.area_uri);
    changeBubbleOrder(area.area_uri);
  };

  const sortedAreas = sortAreasByIds(areas, bubbleOrder);

  return (
    <LocalizationProvider localization={localization}>
      <Canvas
        width={width}
        height={height}
        eventHandlers={{
          onMouseOver: zoom ? undefined : () => setHoveredBubble(null),
          onClick: !zoom ? undefined : () => handleZoomOut(),
        }}
        zoom={zoom}
      >
        {sortedAreas.map((bubble) => (
          <Bubble
            key={bubble.area_uri}
            data={bubble}
            eventHandlers={{
              onMouseOver: zoom ? undefined : () => handleAreaMouseOver(bubble),
              onClick:
                zoomedBubbleUri === bubble.area_uri
                  ? () => handleDeselectPaper()
                  : () => handleZoomIn(bubble),
            }}
            papers={filterData(bubble.papers, searchSettings, filterSettings)}
            hovered={hoveredBubble === bubble.area_uri}
            zoom={zoom}
            zoomed={zoomedBubbleUri === bubble.area_uri}
            baseUnit={baseUnit}
          />
        ))}
      </Canvas>
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  zoom: state.zoom,
  zoomedBubbleUri: state.selectedBubble ? state.selectedBubble.uri : null,
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
  baseUnit: state.list.baseUnit,
});

export default connect(
  mapStateToProps,
  mapDispatchToMapEntriesProps
)(KnowledgeMap);

const sortAreasByIds = (areas, ids) => {
  const newArray = [...areas];
  ids.forEach((id) => {
    const index = newArray.findIndex((e) => e.area_uri === id);
    newArray.push(newArray[index]);
    newArray.splice(index, 1);
  });

  return newArray;
};
