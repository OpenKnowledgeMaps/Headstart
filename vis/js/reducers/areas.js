import d3 from "d3";

import { getRadiusScale, getResizedScale, getZoomScale } from "../utils/scale";

const areas = (state = { list: [], size: null, options: {} }, action) => {
  if (action.canceled || action.isStreamgraph) {
    return state;
  }
  switch (action.type) {
    case "INITIALIZE": {
      const options = {
        minAreaSize: action.configObject.min_area_size,
        maxAreaSize: action.configObject.max_area_size,
        referenceSize: action.configObject.reference_size,
        bubbleMinScale: action.scalingFactors.bubbleMinScale,
        bubbleMaxScale: action.scalingFactors.bubbleMaxScale,
        zoomFactor: action.configObject.zoom_factor,
      };
      return {
        list: action.areas,
        size: action.chartSize,
        options,
      };
    }
    case "RESIZE":
      return {
        ...state,
        size: action.chartSize,
        list: resizeAreas(
          state.list,
          state.size,
          action.chartSize,
          state.options
        ),
      };
    case "ZOOM_IN":
      return {
        ...state,
        list: zoomAreas(
          action.selectedAreaData.uri,
          state.list,
          state.size,
          state.options
        ),
      };
    case "APPLY_FORCE_AREAS":
      return {
        ...state,
        list: action.areasArray,
      };
    default:
      return state;
  }
};

const resizeAreas = (areas, currentSize, newSize, options) => {
  const resizedAreas = areas.slice(0);

  let coordsScale = getResizedScale(currentSize, newSize);

  let rs = resizedAreas.map((e) => e.origR);
  let rScale = getRadiusScale(d3.extent(rs), newSize, options);

  resizedAreas.forEach((area) => {
    area.x = coordsScale(area.x);
    area.y = coordsScale(area.y);
    area.r = rScale(area.origR);

    area.zoomedX = coordsScale(area.zoomedX);
    area.zoomedY = coordsScale(area.zoomedY);
    area.zoomedR = (area.zoomedR * newSize) / currentSize;
  });

  return resizedAreas;
};

const zoomAreas = (zoomedAreaUri, areas, size, options) => {
  const zoomedAreas = areas.slice(0);
  const zoomedArea = zoomedAreas.find((a) => a.area_uri == zoomedAreaUri);

  const xBubbleScale = getZoomScale(zoomedArea.x, zoomedArea.r, size, "bubble");
  const yBubbleScale = getZoomScale(zoomedArea.y, zoomedArea.r, size, "bubble");

  const xPaperScale = getZoomScale(zoomedArea.x, zoomedArea.r, size, "paper");
  const yPaperScale = getZoomScale(zoomedArea.y, zoomedArea.r, size, "paper");

  const sizeCoefficient = (size / 2.0 / zoomedArea.r) * options.zoomFactor;

  zoomedAreas.forEach((area) => {
    area.zoomedX = xBubbleScale(area.x);
    area.zoomedY = yBubbleScale(area.y);
    area.zoomedR = area.r * sizeCoefficient;

    area.papers.forEach((paper) => {
      // this is needed for zoom from zoom
      paper.prevZoomedX = paper.zoomedX;
      paper.prevZoomedY = paper.zoomedY;
      paper.prevZoomedWidth = paper.zoomedWidth;
      paper.prevZoomedHeight = paper.zoomedHeight;

      paper.zoomedX = xPaperScale(paper.x);
      paper.zoomedY = yPaperScale(paper.y);

      paper.zoomedWidth = paper.width * sizeCoefficient;
      paper.zoomedHeight = paper.height * sizeCoefficient;
    });
  });

  return zoomedAreas;
};

export default areas;
