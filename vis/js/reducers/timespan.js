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
};

const getTimespan = (config, context) => {
  if (!context.params || !context.params.from || !context.params.to) {
    return null;
  }

  const displayFormat = config.service === "doaj" ? "yyyy" : "d mmm yyyy";
  const hyphenFormat = config.service === "doaj" ? "yyyy" : "yyyy-mm-dd";

  const today = new Date();
  const from = new Date(context.params.from);
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

  today.setTime(today.getTime() + today.getTimezoneOffset() * 60 * 1000);
  from.setTime(from.getTime() + from.getTimezoneOffset() * 60 * 1000);
  to.setTime(to.getTime() + to.getTimezoneOffset() * 60 * 1000);

  const toFormatted = dateFormat(to, displayFormat);
  const modifier = getModifier(config, context);
  // most recent streamgraphs straight away display "Until xyz",
  // other maps have a more complicated logic
  if (!config.is_streamgraph || modifier !== "most-recent") {
    const defaultFromHyphenated = SERVICE_START[config.service] || "1970-01-01";

    const fromHyphenated = dateFormat(from, hyphenFormat);
    const fromFormatted = dateFormat(from, displayFormat);

    if (fromHyphenated !== defaultFromHyphenated) {
      return fromFormatted + " - " + toFormatted;
    }

    const toHyphenated = dateFormat(to, hyphenFormat);
    const todayHyphenated = dateFormat(today, hyphenFormat);

    if (toHyphenated === todayHyphenated) {
      return "All time";
    }
  }

  return "Until " + toFormatted;
};

export default timespan;
