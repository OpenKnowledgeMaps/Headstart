// @ts-nocheck

import d3 from "d3";

export const CHART_MARGIN = { top: 20, right: 50, bottom: 70, left: 70 };
export const MAX_TICKS_X = 8;
export const AXIS_PADDING = {
  left: -35,
  bottom: 35,
};
export const LABEL_ROUND_FACTOR = 4; // border-radius labels
export const LINE_HELPER_MARGIN = 10; // relative to mouse position
export const TOOLTIP_OFFSET = {
  // relative to mouse position
  top: -10,
  left: LINE_HELPER_MARGIN,
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
 * Needs refactoring before any extension: the forEach is a mess.
 *
 * @param {Object} label d3 node representing the label
 * @param {Object} area d3 node representing the labelled area
 * @param {Function} xScale d3 scale for x coordinate
 * @param {Function} yScale d3 scale for y coordinate
 * @param {number} width streamgraph chart width
 */
export const getLabelPosition = (label: any, area: any, xScale: any, yScale: any, width: number) => {
  const maxY = d3.max(area.values, (x: any) => x.y);
  const labelWidth =
    label.getBBox().width +
    COLOR_RECT_WIDTH +
    COLOR_RECT_MARGIN_RIGHT +
    2 * EDGE_WIDTH;
  const labelHeight = label.getBBox().height + 2 * EDGE_WIDTH;
  let finalX: number;
  let finalY: number;

  area.values.forEach((el: any) => {
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
const areEqualEnough = (a: any, b: any, delta = 0.01) => {
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
const labelSortComparator = (a: any, b: any) => {
  if (areEqualEnough(a.center_x, b.center_x)) {
    if (areEqualEnough(a.y, b.y)) {
      return 0;
    }

    // the higher on screen the label is, the later we want to reposition it (higher y is less)
    return -1 * Math.sign(a.y - b.y);
  }

  // the more on the right on screen the label is, the later we want to reposition it (lower x is less)
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
const areOverlapping = (rect1: any, rect2: any) => {
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
const getShiftDistance = (shiftedRect: any, otherRect: any, moveUp = true) => {
  if (moveUp) {
    return otherRect.height + otherRect.y - shiftedRect.y;
  }
  return -shiftedRect.height + otherRect.y - shiftedRect.y;
};

/**
 * This function moves the labels from the `labels` array by `offsetY` one by one,
 * while there's an overlap with the next label below.
 *
 * The offset changes in the loop: its value is determined by the last
 * repositioning.
 *
 * @param {Array} labels the list of already positioned labels
 * @param {Number} offsetY the initial offset in px
 */
const moveLabelsCheckOverlap = (labels: any, offsetY: any) => {
  labels.sort((a: any, b: any) => a.y - b.y);

  for (let i = 0; i < labels.length - 1; i++) {
    const label = labels[i];
    const nextLabel = labels[i + 1];

    label.y = label.y + offsetY;
    if (!areOverlapping(label, nextLabel)) {
      break;
    }
    offsetY = -getShiftDistance(label, nextLabel, false);
  }
};

/**
 * Group the labels into columns by their `center_x` value.
 *
 * @param {Array} labelPositions array of positions returned by getLabelPosition
 * @returns array of arrays of positions groupped by their `center_x` value
 */
const groupLabelColumns = (labelPositions: Record<string, string>[]) => {
  labelPositions.sort(labelSortComparator);
  let currentColumn: any = [];
  const result = [];

  labelPositions.forEach((label) => {
    if (
      currentColumn.length > 0 &&
      currentColumn[0].center_x !== label.center_x
    ) {
      result.push(currentColumn);
      currentColumn = [];
    }

    currentColumn.push(label);
  });

  if (currentColumn.length > 0) {
    result.push(currentColumn);
  }

  return result;
};

/**
 * Finds colliding labels and recalculates their positions.
 *
 * Algorithm:
 *  1) sort the labels by their x value (ascending) and group them into columns
 *  2) in the sorted order one column by one, position the labels
 *   a) check whether the currently positioned label overlaps some of the already positioned labels
 *   b) if there's an overlap, move the currently positioned label and keep checking
 *      (move the label up in odd columns and down in even columns)
 *   c) if a label overflows from the visualization, move it back and adjust the positions of the other labels
 *
 * To produce better-looking results, the direction of the positioned label shift changes
 * in each column. That means also the direction of the cycle that goes through the already positioned
 * labels has to change.
 *
 * @param {Array} labelPositions array of positions returned by getLabelPosition
 */
export const recalculateOverlappingLabels = (labelPositions: Record<string, string>[]) => {
  const columns = groupLabelColumns([...labelPositions]);

  let moveUp = false;
  for (const column of columns) {
    moveUp = !moveUp;
    const labelComparator = (a: any, b: any) => (moveUp ? a.y - b.y : b.y - a.y);
    column.sort(labelComparator);

    for (const label of column) {
      if (label.repositioned) {
        continue;
      }

      const repositionedLabels = labelPositions.filter((l) => l.repositioned);
      repositionedLabels.sort(labelComparator);

      for (const otherLabel of repositionedLabels) {
        if (areOverlapping(label, otherLabel)) {
          const shiftDistance = getShiftDistance(label, otherLabel, moveUp);
          label.y = label.y + shiftDistance;
        }
      }

      // label overflowing the vis
      if (label.y < 0) {
        const overflow = 0 - label.y;
        label.y = 0;

        moveLabelsCheckOverlap(repositionedLabels, overflow);
      }

      label.repositioned = true;
    }
  }

  return labelPositions;
};

/**
 * No idea what this does - this function was migrated from the
 * old streamgraph.js
 *
 * @param {*} element
 * @param {*} m
 */
export const setTM = (element: any, m: any) => {
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
const amendData = (parsedData: any) => {
  // Add entries to x axis
  const xArray = parsedData.x;
  xArray.unshift((parseInt(xArray[0]) - 1).toString());
  xArray.push((parseInt(xArray[xArray.length - 1]) + 1).toString());

  // Add entries to y axis
  parsedData.subject.forEach((element: any) => {
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
export const transformData = (parsedData: any) => {
  const amendedData = amendData(parsedData);
  const transformedData: any = [];

  amendedData.subject.forEach((stream: any) => {
    let count = 0;
    stream.y.forEach((dataPoint: any) => {
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
