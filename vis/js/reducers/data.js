import d3 from "d3";

import { getDiameterScale, getResizedScale } from "../utils/scale";

const data = (state = { list: [], options: {}, size: null }, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE": {
      const options = {
        referenceSize: action.configObject.reference_size,
        minDiameterSize: action.configObject.min_diameter_size,
        maxDiameterSize: action.configObject.max_diameter_size,
        paperMinScale: action.scalingFactors.paperMinScale,
        paperMaxScale: action.scalingFactors.paperMaxScale,
        paperWidthFactor: action.configObject.paper_width_factor,
        paperHeightFactor: action.configObject.paper_height_factor,
        isStreamgraph: action.configObject.is_streamgraph,
      };

      return { list: action.papers, options, size: action.chartSize };
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
