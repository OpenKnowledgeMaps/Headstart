// @ts-nocheck

import dateFormat from "dateformat";

import { STREAMGRAPH_MODE } from "./chartType";
import { getModifier } from "./contextLine";

const timespan = (state = null, action: any) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE":
      return getTimespan(action.configObject, action.contextObject);
    default:
      return state;
  }
};

const SERVICE_START = {
  doaj: "1809",
  pubmed: "1809-01-01",
  base: "1665-01-01",
  triple: "1750",
  default: "1970-01-01",
};

const SERVICE_DISPLAY_FORMAT = {
  doaj: "yyyy",
  triple: "yyyy",
  default: "d mmm yyyy",
};

const SERVICE_HYPHEN_FORMAT = {
  doaj: "yyyy",
  triple: "yyyy",
  default: "yyyy-mm-dd",
};

const getTimespan = (config, context) => {
  if (!context.params || !context.params.from || !context.params.to) {
    return null;
  }

  const displayFormat =
    SERVICE_DISPLAY_FORMAT[config.service] || SERVICE_DISPLAY_FORMAT.default;
  const hyphenFormat =
    SERVICE_HYPHEN_FORMAT[config.service] || SERVICE_HYPHEN_FORMAT.default;

  const today = getTodayDate();
  const from = getFromDate(context);
  const to = getToDate(context, today);

  const toFormatted = dateFormat(to, displayFormat, true);
  const modifier = getModifier(config, context);
  // most recent streamgraphs straight away display "Until xyz",
  // other maps have a more complicated logic

  const { visualization_type: visualizationType } = config;
  const isNotStreamgraph = visualizationType !== STREAMGRAPH_MODE;
  if (isNotStreamgraph || modifier !== "most-recent") {
    const defaultFromHyphenated =
      SERVICE_START[config.service] || SERVICE_START.default;

    const fromHyphenated = dateFormat(from, hyphenFormat, true);
    const fromFormatted = dateFormat(from, displayFormat, true);

    if (fromHyphenated !== defaultFromHyphenated) {
      return `${fromFormatted} - ${toFormatted}`;
    }
  }

  return `Until ${toFormatted}`;
};

// the dates are formatted in UTC: shifting them by getTimezoneOffset() is
// wrong for historical dates, whose local offset is not a whole number of
// minutes (e.g. 1665-01-01 was displayed as 31 Dec 1664 in Pacific time)
const getTodayDate = () => new Date();

const getFromDate = (context) => new Date(context.params.from);

const getToDate = (context, today) => {
  const to = new Date(context.params.to);
  if (
    typeof context.params.to === "string" &&
    context.params.to.match(/^\d{4}$/)
  ) {
    to.setUTCMonth(11);
    to.setUTCDate(31);
  }
  if (to.getTime() > today.getTime()) {
    to.setTime(today.getTime());
  }

  return to;
};

export default timespan;
