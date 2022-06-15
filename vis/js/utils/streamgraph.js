import d3 from "d3";

export const CHART_MARGIN = { top: 20, right: 50, bottom: 70, left: 70 };
export const MAX_TICKS_X = 8;
export const AXIS_PADDING = {
  left: -30,
  bottom: 35,
};
export const LABEL_ROUND_FACTOR = 4; // border-radius labels
export const LINE_HELPER_MARGIN = -10; // relative to mouse position
export const TOOLTIP_OFFSET = {
  // relative to mouse position
  top: -150,
  left: -10,
};

// white label background dimensions
export const LABEL_BORDER_WIDTH = 5;
export const LABEL_MARGIN = 1;
export const EDGE_WIDTH = LABEL_BORDER_WIDTH + LABEL_MARGIN;

// color rectangle width and left margin
export const COLOR_RECT_WIDTH = 12;
export const COLOR_RECT_MARGIN_RIGHT = 3;

// minimum space between the canvas border and the label
export const CANVAS_PADDING_LEFT = 8;

/**
 * Returns a position object of a streamgraph area label.
 *
 * Migrated from old streamgraph.js...
 *
 * @param {Object} label d3 node representing the label
 * @param {Object} area d3 node representing the labelled area
 * @param {Function} xScale d3 scale for x coordinate
 * @param {Function} yScale d3 scale for y coordinate
 * @param {number} width streamgraph chart width
 */
export const getLabelPosition = (label, area, xScale, yScale, width) => {
  const maxY = d3.max(area.values, (x) => x.y);
  const labelWidth =
    label.getBBox().width +
    COLOR_RECT_WIDTH +
    COLOR_RECT_MARGIN_RIGHT +
    2 * EDGE_WIDTH;
  const labelHeight = label.getBBox().height + 2 * EDGE_WIDTH;
  let finalX, finalY;

  area.values.forEach((el) => {
    if (el.y === maxY) {
      finalX = xScale(el.date) - labelWidth / 2;
      finalY =
        yScale(el.y + el.y0) +
        (yScale(el.y0) - yScale(el.y + el.y0)) / 2 -
        labelHeight / 2 +
        EDGE_WIDTH;
    }
    if (finalX + labelWidth > width) {
      finalX = width - labelWidth;
    }
    if (finalX < CANVAS_PADDING_LEFT) {
      finalX = CANVAS_PADDING_LEFT;
    }
  });

  return {
    key: area.key,
    x: finalX,
    y: finalY,
    width: labelWidth,
    height: labelHeight,
    center_x: finalX + labelWidth / 2,
  };
};

/**
 * Compares two floats and determines if their values are close enough.
 *
 * @param {number} a first float
 * @param {number} b second float
 * @param {float} delta maximal difference of a and b that still can be considered insignificant
 *
 * @returns {boolean} true if the values are equal
 */
const areEqualEnough = (a, b, delta = 0.01) => {
  return Math.abs(a - b) < delta;
};

/**
 * Sort comparator function that compares two rectangles (labels from function getLabelPosition).
 *
 * @param {Object} a first rectangle
 * @param {Object} b second rectangle
 *
 * @returns {number} -1/0/1 based on what rectangle is "greater"
 */
const sortComparator = (a, b) => {
  if (areEqualEnough(a.center_x, b.center_x)) {
    if (areEqualEnough(a.y, b.y)) {
      return 0;
    }

    return 1 * Math.sign(a.y - b.y);
  }

  return 1 * Math.sign(a.center_x - b.center_x);
};

/**
 * Determines whether two rectangles (labels from function getLabelPosition) are overlapping.
 *
 * @param {Object} a first rectangle
 * @param {Object} b second rectangle
 *
 * @returns {boolean} true if a and b are overlapping
 */
const areOverlapping = (rect1, rect2) => {
  return (
    rect1.x <= rect2.x + rect2.width &&
    rect2.x <= rect1.x + rect1.width &&
    rect1.y <= rect2.y + rect2.height &&
    rect2.y <= rect1.y + rect1.height
  );
};

/**
 * If the shiftedRect overlaps the otherRect (labels from function getLabelPosition),
 * this function returns the distance the shiftedRect must be moved to move out of the otherRect.
 *
 * @param {Object} shiftedRect the rectangle we want to move
 * @param {Object} otherRect the overlapped rectangle
 * @param {boolean} moveUp direction of the shift ('up' means increase y)
 *
 * @returns {number} the distance the shiftedRect must move
 */
const getShiftDistance = (shiftedRect, otherRect, moveUp = true) => {
  if (moveUp) {
    return otherRect.height + otherRect.y - shiftedRect.y;
  }
  return -shiftedRect.height + otherRect.y - shiftedRect.y;
};

/**
 * Finds colliding labels and recalculates their positions.
 *
 * Algorithm:
 *  1) sort the labels from the leftmost top to rightmost bottom
 *  2) in the sorted order, position the labels one by one
 *   a) check whether the currently positioned label overlaps some of the already positioned labels
 *   b) if there's an overlap, move the currently positioned label and keep checking
 *
 * To produce better-looking results, the direction of the positioned label shift changes
 * in each column. That means also the direction of the cycle that goes through the already positioned
 * labels has to change.
 *
 * @param {Array} labelPositions array of positions returned by getLabelPosition
 */
export const recalculateOverlappingLabels = (labelPositions) => {
  labelPositions.sort(sortComparator);

  let moveUp = true;
  let lastCenter = null;

  labelPositions.forEach((label) => {
    if (label.repositioned) {
      return;
    }

    if (label.center_x !== lastCenter) {
      lastCenter = label.center_x;
      moveUp = !moveUp;
    }

    const repositionedLabels = labelPositions.filter((l) => l.repositioned);
    repositionedLabels.sort((a, b) => (moveUp ? a.y - b.y : b.y - a.y));
    repositionedLabels.forEach((otherLabel) => {
      if (areOverlapping(label, otherLabel)) {
        const shiftDistance = getShiftDistance(label, otherLabel, moveUp);
        label.y = label.y + shiftDistance;
      }
    });

    label.repositioned = true;
  });

  return labelPositions;
};

/**
 * No idea what this does - this function was migrated from the
 * old streamgraph.js
 *
 * @param {*} element
 * @param {*} m
 */
export const setTM = (element, m) => {
  element.transform.baseVal.initialize(
    element.ownerSVGElement.createSVGTransformFromMatrix(m)
  );
};

/**
 * No idea what this does - this function was migrated from the
 * old streamgraph.js
 *
 * @param {Array} parsedData parsed streamgraph data JSON
 */
const amendData = (parsedData) => {
  // Add entries to x axis
  const xArray = parsedData.x;
  xArray.unshift((parseInt(xArray[0]) - 1).toString());
  xArray.push((parseInt(xArray[xArray.length - 1]) + 1).toString());

  // Add entries to y axis
  parsedData.subject.forEach((element) => {
    element.y.unshift(0);
    element.y.push(0);
  });

  return parsedData;
};

/**
 * No idea what this does - this function was migrated from the
 * old streamgraph.js
 *
 * @param {Array} parsedData parsed streamgraph data JSON
 */
export const transformData = (parsedData) => {
  const amendedData = amendData(parsedData);
  const transformedData = [];

  amendedData.subject.forEach((stream) => {
    let count = 0;
    stream.y.forEach((dataPoint) => {
      transformedData.push({
        key: stream.name,
        value: dataPoint,
        date: new Date(amendedData.x[count]),
        docIds: stream.ids_overall,
      });
      count++;
    });
  });

  return transformedData;
};
