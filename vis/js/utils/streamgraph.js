export const CHART_MARGIN = { top: 20, right: 50, bottom: 70, left: 50 };
export const MAX_TICKS_X = 8;
export const AXIS_PADDING = {
  left: -30,
  bottom: 35,
};
export const LABEL_BORDER_WIDTH = 5; // width labels
export const LABEL_ROUND_FACTOR = 4; // border-radius labels
export const LINE_HELPER_MARGIN = -10; // relative to mouse position
export const TOOLTIP_OFFSET = {
  // relative to mouse position
  top: -150,
  left: -10,
};

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
  const textWidth = label.getBBox().width;
  const textHeight = label.getBBox().height;
  let finalX, finalY;

  area.values.forEach((el) => {
    if (el.y === maxY) {
      finalX = xScale(el.date) - textWidth / 2;
      finalY =
        yScale(el.y + el.y0) +
        (yScale(el.y0) - yScale(el.y + el.y0)) / 2 -
        textHeight / 2;
    }
    if (finalX < 0) {
      finalX = 0;
    } else if (finalX + textWidth > width) {
      finalX = width - textWidth;
    }
  });

  return {
    key: area.key,
    x: finalX,
    y: finalY,
    width: textWidth,
    height: textHeight,
    center_x: finalX + textWidth / 2,
  };
};

/**
 * Sorts and groups the streamgraph labels (repositioning prep).
 *
 * Migrated from old streamgraph.js...
 *
 * @param {Array} labelPositions array of positions returned by getLabelPosition
 */
const groupLabels = (labelPositions) => {
  const compare = (a, b) => {
    if (a.center_x === b.center_x) {
      if (a.y < b.y) {
        return -1;
      }
      if (a.y > b.y) {
        return 1;
      }
      return 0;
    }

    if (a.center_x < b.center_x) {
      return -1;
    }

    if (a.x > b.x) {
      return 1;
    }

    return 0;
  };

  const sortedLabels = labelPositions.sort(compare);
  let prevX = -1;
  let currentGroup = 0;
  sortedLabels.forEach((element, i) => {
    if (prevX === element.center_x || i === 0) {
      element.group = currentGroup;
    } else {
      element.group = ++currentGroup;
    }
    prevX = element.center_x;
  });

  return sortedLabels;
};

/**
 * Returns the overlap of two rectangles.
 *
 * Migrated from old streamgraph.js...
 *
 * @param {Object} rect1
 * @param {Object} rect2
 */
const getOverlap = (rect1, rect2) => {
  if (
    rect1.x <= rect2.x + rect2.width &&
    rect2.x <= rect1.x + rect1.width &&
    rect1.y <= rect2.y + rect2.height &&
    rect2.y <= rect1.y + rect1.height
  ) {
    return rect2.height + LABEL_BORDER_WIDTH * 2;
  }

  return 0;
};

/**
 * Finds colliding labels and moves them apart from each other.
 *
 * Migrated from old streamgraph.js...
 *
 * @param {Array} labelPositions array of positions returned by getLabelPosition
 */
export const moveOverlappingLabels = (labelPositions) => {
  const grouppedLabels = groupLabels([...labelPositions]);
  let moveUp = true;
  let currentGroup = 0;

  grouppedLabels.forEach((element) => {
    if (element.group === 0) {
      return;
    }

    if (element.group !== currentGroup) {
      currentGroup = element.group;
      moveUp = !moveUp;
    }

    grouppedLabels.forEach((anotherElement) => {
      if (anotherElement.group < element.group) {
        const overlap = getOverlap(anotherElement, element);
        if (moveUp) {
          element.y = element.y - overlap;
        } else {
          element.y = element.y + overlap;
        }
      }
    });
  });

  labelPositions.map((label) => {
    grouppedLabels.map((f) => {
      if (f.key === label.key) {
        label.y = f.y;
      }
    });
    return label;
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

  amendedData.subject.forEach((element) => {
    let count = 0;
    element.y.forEach((dataPoint) => {
      transformedData.push({
        key: element.name,
        value: dataPoint,
        date: new Date(amendedData.x[count]),
      });
      count++;
    });
  });

  return transformedData;
};
