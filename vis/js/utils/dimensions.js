// these constants are hardcoded dimensions of various headstart parts
const TITLE_HEIGHT = 54.2;
const TOOLBAR_HEIGHT = 66;
const TITLE_IMAGE_HEIGHT = 70;
const SHOW_HIDE_BTN_HEIGHT = 34;
const FILTER_SECTION_HEIGHT = 68.4;
const CHART_HEIGHT_CORRECTION = 15;
const LIST_HEIGHT_CORRECTION = 10;
const VIS_COL_RATIO = 0.6;
const MODALS_WIDTH = 43;

/**
 * Returns the chart size based on config, context and the outer visualization
 * container (e.g. in project website).
 *  
 * @param {Object} config the headstart config
 * @param {Object} context the headstart context
 */
export const getChartSize = (config, context) => {
  // height section
  const clientHeight = document.documentElement.clientHeight;
  const innerHeight = window.innerHeight;

  let toolbarHeight = 0;
  if (config.scale_toolbar) {
    toolbarHeight = TOOLBAR_HEIGHT;
  }

  let titleImageHeight = 0;
  if (config.is_authorview) {
    titleImageHeight = TITLE_IMAGE_HEIGHT;
  }

  const computedHeight =
    Math.max(clientHeight, innerHeight) -
    Math.max(TITLE_HEIGHT, titleImageHeight) -
    toolbarHeight -
    CHART_HEIGHT_CORRECTION;

  const finalHeight = Math.max(
    config.min_height,
    Math.min(config.max_height, computedHeight)
  );

  // width section
  const visWidth = $(`#${config.tag}`).width();

  const computedWidth = visWidth * VIS_COL_RATIO - MODALS_WIDTH;

  const finalWidth = Math.max(
    config.min_width || 0,
    Math.min(config.max_width || computedWidth, computedWidth)
  );

  return {
    width: finalWidth,
    height: finalHeight,
    size: Math.min(finalWidth, finalHeight),
  };
};

/**
 * Returns the list height based on config, context and the chart height.
 * 
 * @param {Object} config the headstart config
 * @param {Object} context the headstart context
 * @param {Number} chartHeight knowledge map chart height - if not set, it is computed
 */
export const getListSize = (config, context, chartHeight) => {
  if (typeof chartHeight === "undefined") {
    chartHeight = getChartSize(config, context).height;
  }

  let titleImageHeight = 0;
  if (config.is_authorview) {
    titleImageHeight = TITLE_IMAGE_HEIGHT;
  }

  const height =
    Math.max(TITLE_HEIGHT, titleImageHeight) +
    chartHeight -
    SHOW_HIDE_BTN_HEIGHT -
    FILTER_SECTION_HEIGHT +
    LIST_HEIGHT_CORRECTION;

  return { height };
};
