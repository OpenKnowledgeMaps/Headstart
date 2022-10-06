import dateFormat from "dateformat";
import { getModifier } from "./contextLine";

const timespan = (state = null, action) => {
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

  const toFormatted = dateFormat(to, displayFormat);
  const modifier = getModifier(config, context);
  // most recent streamgraphs straight away display "Until xyz",
  // other maps have a more complicated logic
  if (!config.is_streamgraph || modifier !== "most-recent") {
    const defaultFromHyphenated =
      SERVICE_START[config.service] || SERVICE_START.default;

    const fromHyphenated = dateFormat(from, hyphenFormat);
    const fromFormatted = dateFormat(from, displayFormat);

    if (fromHyphenated !== defaultFromHyphenated) {
      return fromFormatted + " - " + toFormatted;
    }
  }

  return "Until " + toFormatted;
};

const getTodayDate = () => {
  const today = new Date();
  today.setTime(today.getTime() + today.getTimezoneOffset() * 60 * 1000);

  return today;
};

const getFromDate = (context) => {
  const from = new Date(context.params.from);
  from.setTime(from.getTime() + from.getTimezoneOffset() * 60 * 1000);

  return from;
};

const getToDate = (context, today) => {
  const to = new Date(context.params.to);
  if (
    typeof context.params.to === "string" &&
    context.params.to.match(/^\d{4}$/)
  ) {
    to.setMonth(11);
    to.setDate(31);
  }
  if (to.getTime() > today.getTime()) {
    to.setTime(today.getTime());
  }

  to.setTime(to.getTime() + to.getTimezoneOffset() * 60 * 1000);

  return to;
};

export default timespan;
