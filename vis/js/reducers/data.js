import d3 from "d3";

import { getDiameterScale, getResizedScale } from "../utils/scale";

const data = (state = { list: [], options: {}, size: null }, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE": {
      const data = action.dataArray;
      const options = {
        maxAreaSize: action.configObject.max_area_size,
        referenceSize: action.configObject.reference_size,
        bubbleMinScale: action.configObject.bubble_min_scale,
        bubbleMaxScale: action.configObject.bubble_max_scale,
        minDiameterSize: action.configObject.min_diameter_size,
        maxDiameterSize: action.configObject.max_diameter_size,
        paperMinScale: action.configObject.paper_min_scale,
        paperMaxScale: action.configObject.paper_max_scale,
        paperWidthFactor: action.configObject.paper_width_factor,
        paperHeightFactor: action.configObject.paper_height_factor,
        isStreamgraph: action.configObject.is_streamgraph,
      };

      let list = data;
      if (!options.isStreamgraph) {
        list = rescalePapers(data, action.chartSize, options);
      }

      return { list, options, size: action.chartSize };
    }
    case "RESIZE": {
      if (state.list.length === 0) {
        return state;
      }

      let list = state.list;
      if (!state.options.isStreamgraph) {
        list = resizePapers(
          state.list,
          state.size,
          action.chartSize,
          state.options
        );
      }

      return { ...state, list, size: action.chartSize };
    }
    case "APPLY_FORCE_PAPERS":
      return { ...state, list: action.dataArray };
    default:
      return state;
  }
};

export default data;

const GOLDEN_RATIO = 2.6;

const rescalePapers = (papers, size, options) => {
  let rescaledPapers = papers.slice(0);

  let xs = rescaledPapers.map((e) => e.x);
  let xScale = getInitialCoordsScale(d3.extent(xs), size, options);

  let ys = rescaledPapers.map((e) => e.y);
  let yScale = getInitialCoordsScale(d3.extent(ys), size, options);

  let diameters = rescaledPapers.map((e) => e.internal_readers);
  let dScale = getDiameterScale(d3.extent(diameters), size, options);

  rescaledPapers.forEach((paper) => {
    paper.x = xScale(paper.x);
    paper.y = yScale(paper.y);
    paper.diameter = dScale(paper.internal_readers);
    paper.width =
      options.paperWidthFactor *
      Math.sqrt(Math.pow(paper.diameter, 2) / GOLDEN_RATIO);
    paper.height =
      options.paperHeightFactor *
      Math.sqrt(Math.pow(paper.diameter, 2) / GOLDEN_RATIO);

    // some fallback values
    paper.zoomedX = paper.x;
    paper.zoomedY = paper.y;
    paper.zoomedWidth = paper.width;
    paper.zoomedHeight = paper.height;
  });

  return rescaledPapers;
};

const COORDS_PADDING = 5;

const getInitialCoordsScale = (extent, size) => {
  const scale = d3.scale
    .linear()
    .range([COORDS_PADDING, size - COORDS_PADDING])
    .domain(extent);

  return (value) => scale(value);
};

const resizePapers = (papers, currentSize, newSize, options) => {
  const resizedPapers = papers.slice(0);

  let coordsScale = getResizedScale(currentSize, newSize);

  let diameters = resizedPapers.map((e) => e.internal_readers);
  let dScale = getDiameterScale(d3.extent(diameters), newSize, options);

  resizedPapers.forEach((paper) => {
    paper.x = coordsScale(paper.x);
    paper.y = coordsScale(paper.y);
    paper.diameter = dScale(paper.internal_readers);
    paper.width =
      options.paperWidthFactor * Math.sqrt(Math.pow(paper.diameter, 2) / 2.6);
    paper.height =
      options.paperHeightFactor * Math.sqrt(Math.pow(paper.diameter, 2) / 2.6);

    paper.zoomedX = coordsScale(paper.zoomedX);
    paper.zoomedY = coordsScale(paper.zoomedY);
    paper.zoomedWidth = (paper.zoomedWidth * newSize) / currentSize;
    paper.zoomedHeight = (paper.zoomedHeight * newSize) / currentSize;
  });

  return resizedPapers;
};
