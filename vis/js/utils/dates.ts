// @ts-nocheck
import dateFormat from "dateformat";

export const getDateTimeFromTimestamp = (timestamp, { inUTC = false } = {}) => {
  if (typeof timestamp !== "string" || !timestamp) {
    return "";
  }

  const date = getDateFromTimestamp(timestamp, { inUTC });
  const time = getTimeFromTimestamp(timestamp, { inUTC });

  if (!date) {
    return "";
  }

  return `on ${date} at ${time}`;
};

export const getDateFromTimestamp = (
  timestamp,
  { format = "d mmm yyyy", inUTC = false } = {}
) => {
  if (typeof timestamp !== "string" || !timestamp) {
    return "";
  }

  const date = parseTimestamp(timestamp);

  try {
    return dateFormat(date, format, inUTC);
  } catch (error) {
    console.warn(`Error while formatting timestamp '${timestamp}'`, error);
    return "";
  }
};

export const getTimeFromTimestamp = (
  timestamp,
  { format = "H:MM", inUTC = false } = {}
) => {
  if (typeof timestamp !== "string" || !timestamp) {
    return "";
  }

  const date = parseTimestamp(timestamp);

  try {
    return dateFormat(date, format, inUTC);
  } catch (error) {
    console.warn(`Error while formatting date '${date}'`, error);
    return "";
  }
};

const parseTimestamp = (timestamp) => {
  if (isNaN(new Date(timestamp))) {
    timestamp = timestamp.trim().replace(/\s+/, "T");
  }

  return new Date(timestamp);
};
