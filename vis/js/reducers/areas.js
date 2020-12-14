import {
  getCoordsScale,
  getRadiusScale,
  getResizedScale,
  getZoomScale,
} from "../utils/scale";

const areas = (state = { list: [], size: null, options: {} }, action) => {
  if (action.canceled) {
    return state;
  }
  switch (action.type) {
    case "INITIALIZE":
      const options = {
        minAreaSize: action.configObject.min_area_size,
        maxAreaSize: action.configObject.max_area_size,
        referenceSize: action.configObject.reference_size,
        bubbleMinScale: action.configObject.bubble_min_scale,
        bubbleMaxScale: action.configObject.bubble_max_scale,
        zoomFactor: action.configObject.zoom_factor,
      };
      return {
        list: getAreas(action.dataArray, action.chartSize, options),
        size: action.chartSize,
        options,
      };
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

const getAreas = (data, size, options) => {
  const areas = {};
  data.forEach((d) => {
    const areaUri = d.area_uri;
    if (areaUri in areas) {
      areas[areaUri].papers.push(d);
      return;
    }

    areas[areaUri] = {};
    areas[areaUri].title = d.area;
    areas[areaUri].area_uri = areaUri;
    areas[areaUri].papers = [d];
  });

  const areasArray = [];
  for (let areaUri in areas) {
    let papers = areas[areaUri].papers;

    let x =
      papers.map((e) => parseFloat(e.x)).reduce((a, b) => a + b, 0) /
      (1.0 * papers.length);
    let y =
      papers.map((e) => -parseFloat(e.y)).reduce((a, b) => a + b, 0) /
      (1.0 * papers.length);

    areas[areaUri].origX = x;
    areas[areaUri].origY = y;

    let readers = papers
      .map((e) => e.internal_readers)
      .reduce((a, b) => a + b, 0);
    areas[areaUri].num_readers = readers;
    // TODO different metrics
    areas[areaUri].origR = readers;

    areasArray.push(areas[areaUri]);
  }

  return rescaleAreas(areasArray, size, options);
};

const rescaleAreas = (areas, size, options) => {
  const rescaledAreas = areas.slice(0);

  let xs = rescaledAreas.map((e) => e.origX);
  let xScale = getCoordsScale(d3.extent(xs), size, options);

  let ys = rescaledAreas.map((e) => e.origY);
  let yScale = getCoordsScale(d3.extent(ys), size, options);

  let rs = rescaledAreas.map((e) => e.origR);
  let rScale = getRadiusScale(d3.extent(rs), size, options);

  rescaledAreas.forEach((area) => {
    area.x = xScale(area.origX);
    area.y = yScale(area.origY);
    area.r = rScale(area.origR);

    // some fallback values
    area.zoomedX = area.x;
    area.zoomedY = area.y;
    area.zoomedR = area.r;
  });

  return rescaledAreas;
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
    area.zoomedR = area.zoomedR * newSize / currentSize;
  });

  return resizedAreas;
};

const zoomAreas = (zoomedAreaUri, areas, size, options) => {
  const zoomedAreas = areas.slice(0);
  const zoomedArea = zoomedAreas.find((a) => a.area_uri === zoomedAreaUri);

  const xScale = getZoomScale(zoomedArea.x, zoomedArea.r, size);
  const yScale = getZoomScale(zoomedArea.y, zoomedArea.r, size);

  const sizeCoefficient = (size / 2.0 / zoomedArea.r) * options.zoomFactor;

  zoomedAreas.forEach((area) => {
    area.zoomedX = xScale(area.x);
    area.zoomedY = yScale(area.y);
    area.zoomedR = area.r * sizeCoefficient;

    area.papers.forEach((paper) => {
      // this is needed for zoom from zoom
      paper.prevZoomedX = paper.zoomedX;
      paper.prevZoomedY = paper.zoomedY;
      paper.prevZoomedWidth = paper.zoomedWidth;
      paper.prevZoomedHeight = paper.zoomedHeight;
      
      paper.zoomedX = xScale(paper.x);
      paper.zoomedY = yScale(paper.y);

      paper.zoomedWidth = paper.width * sizeCoefficient;
      paper.zoomedHeight = paper.height * sizeCoefficient;
    });
  });

  return zoomedAreas;
};

export default areas;
