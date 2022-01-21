import d3 from "d3";

const CIRCLE_PADDING_SIZE = 45;

/**
 * Returns a scaling function that scales the x or y coordinates according to
 * some data and config properties.
 *
 * @param {Array} extent min and max coordinate value in the data (for one axis)
 * @param {Number} size chart size in px
 * @param {Object} options object with additional parameters:
 *  { maxAreaSize, referenceSize, bubbleMaxScale }
 *
 * @returns {Function} that takes coordinate as an argument and returns its scaled value
 */
export const getCoordsScale = (extent, size, options) => {
  const circleMax = getCircleSize(
    size,
    options.maxAreaSize,
    options.bubbleMaxScale,
    options.referenceSize
  );

  const circlePadding = circleMax / 2 + CIRCLE_PADDING_SIZE;
  const scale = d3.scale
    .linear()
    .range([circlePadding, size - circlePadding])
    .domain(extent);

  return (value) => scale(value);
};

/**
 * Returns a scaling function that scales the radius according to
 * some data and config properties.
 *
 * @param {Array} extent min and max radii in the data
 * @param {Number} size chart size in px
 * @param {Object} options object with additional parameters:
 *  { minAreaSize, maxAreaSize, referenceSize, bubbleMinScale, bubbleMaxScale }
 *
 * @returns {Function} that takes radius as an argument and returns its scaled value
 */
export const getRadiusScale = (extent, size, options) => {
  const circleMin = getCircleSize(
    size,
    options.minAreaSize,
    options.bubbleMinScale,
    options.referenceSize
  );
  const circleMax = getCircleSize(
    size,
    options.maxAreaSize,
    options.bubbleMaxScale,
    options.referenceSize
  );

  const scale = d3.scale.sqrt().range([circleMin, circleMax]).domain(extent);

  return (value) => scale(value);
};

/**
 * Returns a scaling function that scales the paper diameter according to
 * some data and config properties.
 *
 * @param {Array} extent min and max value of the chosen size metric
 * @param {Number} size chart size in px
 * @param {Object} options object with additional parameters:
 *  { referenceSize, minDiameterSize, maxDiameterSize, paperMinScale, paperMaxScale }
 *
 * @returns {Function} that takes diameter as an argument and returns its scaled value
 */
export const getDiameterScale = (extent, size, options) => {
  const correctionFactor = getCorrectionFactor(size, options.referenceSize);
  const paperMin =
    options.minDiameterSize * correctionFactor * options.paperMinScale;
  const paperMax =
    options.maxDiameterSize * correctionFactor * options.paperMaxScale;

  const scale = d3.scale.sqrt().range([paperMin, paperMax]).domain(extent);

  return (value) => scale(value);
};

const COORDS_PADDING = 5;
/**
 * Returns a scaling function that scales the papers according to the chart size.
 * 
 * @param {Array} extent min and max paper coordinate
 * @param {number} size chart size in px
 * 
 * @returns scaling function
 */
export const getInitialCoordsScale = (extent, size) => {
  const scale = d3.scale
    .linear()
    .range([COORDS_PADDING, size - COORDS_PADDING])
    .domain(extent);

  return (value) => scale(value);
};

/**
 * Returns a scaling function that scales any coordinates from the previous chart size
 * to the new one.
 *
 * @param {Number} currentSize previous chart size
 * @param {Number} newSize new chart size
 *
 * @returns {Function} that takes coordinate as an argument and returns its scaled value
 */
export const getResizedScale = (currentSize, newSize) => {
  const scale = d3.scale.linear().domain([0, currentSize]).range([0, newSize]);

  return (value) => scale(value);
};

const PADDING_RATIO = { bubble: 0.08, paper: 0 };
const ZOOMED_PADDING_SIZE = { bubble: 60, paper: 35 };

/**
 * Returns a scaling function that zooms a coordinate (either x or y) based on the current
 * size, and the zoomed area coordinate (either x or y) and its radius.
 *
 * @param {Number} coordinateValue x or y coordinate of the zoomed area
 * @param {Number} radius the zoomed area radius
 * @param {Number} size current chart size in px
 * @param {String} type 'bubble' or 'paper'
 */
export const getZoomScale = (coordinateValue, radius, size, type) => {
  const padding = radius * PADDING_RATIO[type];

  const scale = d3.scale
    .linear()
    .domain([
      coordinateValue - radius + padding,
      coordinateValue + radius - padding,
    ])
    .range([ZOOMED_PADDING_SIZE[type], size - ZOOMED_PADDING_SIZE[type]]);

  return (value) => scale(value);
};

const getCorrectionFactor = (size, referenceSize) => {
  return size / referenceSize;
};

const getCircleSize = (chartSize, circleSize, bubbleScale, referenceSize) => {
  const correctionFactor = getCorrectionFactor(chartSize, referenceSize);
  return circleSize * correctionFactor * bubbleScale;
};
