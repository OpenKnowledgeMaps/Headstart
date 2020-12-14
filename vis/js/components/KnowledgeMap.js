import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import LocalizationProvider from "./LocalizationProvider";

import { filterData } from "../utils/data";
import Bubble from "../templates/Bubble";
import Canvas from "../templates/Canvas";
import Paper from "../templates/Paper";

import { mapDispatchToMapEntriesProps } from "../utils/eventhandlers";

const KnowledgeMap = ({
  zoom,
  zoomedBubbleUri,
  highlightedBubbleUri,
  selectedPaperId,
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
  handleSelectPaper,
  animation,
}) => {
  // bubble section
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

  const handleOtherAreaZoomIn = (bubble) => {
    handleZoomIn(bubble, true);
    handleDeselectPaper();
  };

  const getBubbleZoomClickHandler = (bubble) => {
    if (zoomedBubbleUri === bubble.area_uri) {
      return handleDeselectPaper;
    }

    if (zoom) {
      return () => handleOtherAreaZoomIn(bubble);
    }

    return () => handleZoomIn(bubble);
  };

  const sortedAreas = sortAreasByIds(areas, bubbleOrder);

  const getCanvasEventHandlers = () => {
    if (animation) {
      return {};
    }

    let onClick = undefined;
    let onMouseOver = undefined;
    if (zoom) {
      onClick = handleZoomOut;
    } else {
      onMouseOver = () => setHoveredBubble(null);
    }

    return { onClick, onMouseOver };
  };

  const getBubbleEventHandlers = (bubble) => {
    if (animation) {
      return {};
    }

    let onClick = getBubbleZoomClickHandler(bubble);
    let onMouseOver = undefined;
    if (!zoom) {
      onMouseOver = () => handleAreaMouseOver(bubble);
    }
    let onDoubleClick = undefined;
    if (zoomedBubbleUri === bubble.area_uri) {
      onDoubleClick = handleZoomOut;
    }

    return { onClick, onMouseOver, onDoubleClick };
  };

  // paper section
  const [paperOrder, setPaperOrder] = useState([]);
  const changePaperOrder = (paperId) => {
    const newPaperOrder = paperOrder.filter((id) => id !== paperId);
    newPaperOrder.push(paperId);
    setPaperOrder(newPaperOrder);
  };

  const renderPaper = (paper) => {
    const selected = selectedPaperId === paper.safe_id;
    const handlePaperClick = (event) => {
      if (!zoom) {
        handleZoomIn(
          areas.find((bubble) => bubble.area_uri === paper.area_uri)
        );
        return;
      }

      if (selected) {
        return;
      }

      // this is necessary so the paper is not deselected immediately with the
      // bubble click event
      event.stopPropagation();
      handleSelectPaper(paper);
    };

    const handlePaperMouseOver = () => {
      changePaperOrder(paper.safe_id);
    };

    return (
      <Paper
        key={paper.safe_id}
        data={paper}
        readersLabel={baseUnit}
        zoom={zoom}
        selected={selected}
        onClick={animation !== null ? undefined : handlePaperClick}
        onMouseOver={animation !== null ? undefined : handlePaperMouseOver}
        animation={animation}
      />
    );
  };

  const getSortedPapers = (papers) => {
    const newArray = [...papers];
    paperOrder.forEach((id) => {
      const index = newArray.findIndex((e) => e.safe_id === id);
      newArray.push(newArray[index]);
      newArray.splice(index, 1);
    });

    return newArray;
  };

  const inactivePapers = data.filter(
    (p) => p.area_uri !== hoveredBubble && p.area_uri !== zoomedBubbleUri
  );
  const activePapers = getSortedPapers(
    data.filter(
      (p) => p.area_uri === hoveredBubble || p.area_uri === zoomedBubbleUri
    )
  );

  return (
    <LocalizationProvider localization={localization}>
      <Canvas
        width={width}
        height={height}
        eventHandlers={getCanvasEventHandlers()}
        zoom={zoom}
      >
        {!zoom && inactivePapers.map((paper) => renderPaper(paper))}
        {sortedAreas.map((bubble) => (
          <Bubble
            key={bubble.area_uri}
            data={bubble}
            eventHandlers={getBubbleEventHandlers(bubble)}
            papers={filterData(bubble.papers, searchSettings, filterSettings)}
            hovered={hoveredBubble === bubble.area_uri}
            zoom={zoom}
            zoomed={zoomedBubbleUri === bubble.area_uri}
            baseUnit={baseUnit}
            selectedPaperId={selectedPaperId}
            handleSelectPaper={handleSelectPaper}
            animation={animation}
            highlighted={highlightedBubbleUri === bubble.area_uri}
          />
        ))}
        {activePapers.map((paper) => renderPaper(paper))}
      </Canvas>
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  zoom: state.zoom,
  zoomedBubbleUri: state.selectedBubble ? state.selectedBubble.uri : null,
  highlightedBubbleUri: state.hoveredBubble,
  selectedPaperId: state.selectedPaper ? state.selectedPaper.safeId : null,
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
    isStreamgraph: false,
    title: state.selectedBubble ? state.selectedBubble.title : null,
  },
  localization: state.localization,
  width: state.chart.width,
  height: state.chart.height,
  baseUnit: state.list.isContentBased ? undefined : state.list.baseUnit,
  animation: state.animation,
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
