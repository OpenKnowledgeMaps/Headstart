import { getDiameterScale, getResizedScale } from "../utils/scale";

const data = (state = { list: [], options: {}, size: null }, action) => {
  if (action.canceled) {
    return state;
  }

  let list = null;

  switch (action.type) {
    case "INITIALIZE":
      // TODO move the whole io.js dataprocessing somewhere here
      let data = sanitizeData(action.dataArray);
      let options = {
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

      list = data;
      if (!options.isStreamgraph) {
        list = rescalePapers(data, action.chartSize, options);
      }

      return { list, options, size: action.chartSize };
    case "RESIZE":
      if (state.list.length === 0) {
        return state;
      }

      list = state.list;
      if (!state.options.isStreamgraph) {
        list = resizePapers(
          state.list,
          state.size,
          action.chartSize,
          state.options
        );
      }

      return { ...state, list, size: action.chartSize };
    case "APPLY_FORCE_PAPERS":
      return { ...state, list: action.dataArray };
    default:
      return state;
  }
};

export default data;

const ATTRS_TO_CHECK = [
  "id",
  "authors",
  "title",
  "paper_abstract",
  "year",
  "oa_state",
  "subject_orig",
  "relevance",
  "x",
  "y",
  "area_uri",
  "area",
  "cluster_labels",
];

const MANDATORY_ATTRS = {
  area_uri: {
    derive: (entry) => entry.area,
  },
};

const ALLOWED_TYPES = {
  area_uri: ["number", "string"],
};

const sanitizeData = (data) => {
  let missingAttributes = new Map();
  let wrongTypes = new Set();

  data.forEach((entry) => {
    ATTRS_TO_CHECK.forEach((attr) => {
      if (typeof entry[attr] === "undefined") {
        if (!missingAttributes.has(attr)) {
          missingAttributes.set(attr, 0);
        }
        missingAttributes.set(attr, missingAttributes.get(attr) + 1);

        if (MANDATORY_ATTRS[attr]) {
          entry[attr] = MANDATORY_ATTRS[attr].derive(entry);
        }
      }

      if (ALLOWED_TYPES[attr]) {
        if (entry[attr] && !ALLOWED_TYPES[attr].includes(typeof entry[attr])) {
          entry[attr] = entry[attr].toString();
          wrongTypes.add(attr);
        }
      }
    });
  });

  missingAttributes.forEach((value, key) => {
    console.warn(
      `Attribute '${key}' missing in ${
        value === data.length ? "all" : value
      } data entries.`
    );
  });

  if (wrongTypes.size > 0) {
    console.warn(
      `Incorrect data types found and corrected in the following properties: `,
      wrongTypes
    );
  }

  return data;
};

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
