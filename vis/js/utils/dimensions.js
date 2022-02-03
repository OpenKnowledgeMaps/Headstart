import $ from "jquery";

// these constants are hardcoded dimensions of various headstart parts
const TITLE_HEIGHT = 60;
const TOOLBAR_HEIGHT = 66;
const TITLE_IMAGE_HEIGHT = 70;
const SHOW_HIDE_BTN_HEIGHT = 34;
const FILTER_SECTION_HEIGHT = 68.4;
const CHART_HEIGHT_CORRECTION = 15;
const LIST_HEIGHT_CORRECTION = 10;
const VIS_COL_RATIO = 0.6;
const MODALS_WIDTH = 43;

const CREATED_BY_HEIGHT = 50;

const FOOTER_HEIGHT = {
  base: CREATED_BY_HEIGHT,
  pubmed: CREATED_BY_HEIGHT,
  triple: CREATED_BY_HEIGHT,
  default: 0,
};

/**
 * Returns the chart size based on config, context and the outer visualization
 * container (e.g. in project website).
 *
 * @param {Object} config the headstart config
 */
export const getChartSize = (config) => {
  const container = $(`#${config.tag}`);

  // height section
  const parentHeight = getRealHeight(container);
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

  const footerHeight = getFooterHeight(config);

  const computedHeight =
    (parentHeight === 0
      ? Math.max(clientHeight, innerHeight)
      : container.height()) -
    Math.max(TITLE_HEIGHT, titleImageHeight) -
    toolbarHeight -
    footerHeight -
    CHART_HEIGHT_CORRECTION;

  const finalHeight = Math.max(
    config.min_height,
    Math.min(config.max_height, computedHeight)
  );

  // width section
  const visWidth = container.width();

  // MODALS_WIDTH subtraction is questionable - I disabled it for streamgraph
  const computedWidth =
    visWidth * VIS_COL_RATIO - (config.is_streamgraph ? 0 : MODALS_WIDTH);

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
    chartHeight = getChartSize(config, context).size;
  }

  let titleImageHeight = 0;
  if (config.is_authorview) {
    titleImageHeight = TITLE_IMAGE_HEIGHT;
  }

  const footerHeight = getFooterHeight(config);

  const height =
    Math.max(TITLE_HEIGHT, titleImageHeight) +
    chartHeight +
    footerHeight -
    SHOW_HIDE_BTN_HEIGHT -
    FILTER_SECTION_HEIGHT +
    LIST_HEIGHT_CORRECTION;

  return { height };
};

/**
 * Determines the actual height of the element.
 *
 * Copied from the original helpers.js
 *
 * @param {Element} element jquery selected element
 * @return {Number} real height of the element
 */
const getRealHeight = (element) => {
  let height = 0;
  if (element.children().length > 0) {
    const temp = $("<div></div>");
    temp.append(element.children());
    height = element.height();
    element.append(temp.children());
  } else {
    const html = element.html();
    element.html("");
    height = element.height();
    element.html(html);
  }

  return height;
};

const getFooterHeight = (config) => {
  if (!config.credit_embed) {
    return 0;
  }

  if (FOOTER_HEIGHT[config.service]) {
    return FOOTER_HEIGHT[config.service];
  }

  return FOOTER_HEIGHT.default;
};
