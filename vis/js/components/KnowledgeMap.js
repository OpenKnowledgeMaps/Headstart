import React from "react";
import { connect } from "react-redux";

import { filterData } from "../utils/data";
import Bubble from "../templates/Bubble";
import Chart from "../templates/Chart";
import Paper from "../templates/Paper";

import { mapDispatchToMapEntriesProps } from "../utils/eventhandlers";

const KnowledgeMap = (props) => {
  const { data, areas, zoom, animation } = props;
  const { width, height, baseUnit, enlargeFactor } = props;
  const { zoomedBubbleUri, highlightedBubbleUri, selectedPaperId } = props;
  const { searchSettings, filterSettings } = props;
  const { handleZoomIn, handleZoomOut } = props;
  const { handleDeselectPaper, handleSelectPaper } = props;
  const { hoveredBubble, bubbleOrder, changeBubbleOrder } = props;
  const { hoveredPaper, paperOrder, changePaperOrder } = props;

  // bubble section
  const handleAreaMouseOver = (area) => {
    if (hoveredBubble === area.area_uri) {
      return;
    }

    changeBubbleOrder(area.area_uri);
  };

  const handleOtherAreaZoomIn = (bubble) => {
    handleDeselectPaper();
    handleZoomIn(bubble, true);
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

  const getChartEventHandlers = () => {
    let onClick = undefined;
    let onMouseOver = () => changeBubbleOrder(null);
    if (zoom) {
      onClick = handleZoomOut;
      onMouseOver = undefined;
    }

    return { onClick, onMouseOver };
  };

  const getBubbleEventHandlers = (bubble) => {
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

    const handlePaperMouseOver = (newEnlargeFactor) => {
      changePaperOrder(paper.safe_id, newEnlargeFactor);
    };

    const handlePaperMouseOut = () => {
      changePaperOrder(null);
    };

    return (
      <Paper
        key={paper.safe_id}
        data={paper}
        readersLabel={baseUnit}
        zoom={zoom}
        selected={selected}
        hovered={hoveredPaper === paper.safe_id}
        onClick={handlePaperClick}
        onMouseOver={handlePaperMouseOver}
        onMouseOut={handlePaperMouseOut}
        animation={animation}
        maxSize={height / 2.0}
        enlargeFactor={enlargeFactor}
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

  const papers = filterData(data, searchSettings, filterSettings);

  const inactivePapers = papers.filter(
    (p) => p.area_uri !== hoveredBubble && p.area_uri !== zoomedBubbleUri
  );
  const activePapers = getSortedPapers(
    papers.filter(
      (p) => p.area_uri === hoveredBubble || p.area_uri === zoomedBubbleUri
    )
  );

  return (
    <Chart
      width={width}
      height={height}
      eventHandlers={getChartEventHandlers()}
      zoom={zoom}
    >
      {!zoom && inactivePapers.map((paper) => renderPaper(paper))}
      {sortedAreas.map((bubble) => (
        <Bubble
          key={bubble.area_uri}
          data={bubble}
          eventHandlers={getBubbleEventHandlers(bubble)}
          hovered={hoveredBubble === bubble.area_uri}
          zoom={zoom}
          zoomed={zoomedBubbleUri === bubble.area_uri}
          baseUnit={baseUnit}
          animation={animation}
          highlighted={highlightedBubbleUri === bubble.area_uri}
        />
      ))}
      {activePapers.map((paper) => renderPaper(paper))}
    </Chart>
  );
};

const mapStateToProps = (state) => ({
  zoom: state.zoom,
  zoomedBubbleUri: state.selectedBubble ? state.selectedBubble.uri : null,
  highlightedBubbleUri: state.highlightedBubble,
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
  width: state.chart.width,
  height: state.chart.height,
  baseUnit: state.list.isContentBased ? undefined : state.list.baseUnit,
  animation: state.animation,
  hoveredBubble: state.bubbleOrder.hoveredBubble,
  bubbleOrder: state.bubbleOrder.order,
  hoveredPaper: state.paperOrder.hoveredPaper,
  paperOrder: state.paperOrder.order,
  enlargeFactor: state.paperOrder.enlargeFactor,
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
