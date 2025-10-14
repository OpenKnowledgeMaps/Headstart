import dateFormat from "dateformat";

export const getDateTimeFromTimestamp = (
  timestamp?: string,
  { inUTC = false } = {}
) => {
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
  timestamp: string,
  { format = "d mmm yyyy", inUTC = false } = {}
) => {
  if (typeof timestamp !== "string" || !timestamp) {
    return "";
  }

  const date = parseTimestamp(timestamp);

  if (!date) return "";

  try {
    return dateFormat(date, format, inUTC);
  } catch (error) {
    console.warn(`Error while formatting timestamp '${timestamp}'`, error);
    return "";
  }
};

export const getTimeFromTimestamp = (
  timestamp: string,
  { format = "H:MM", inUTC = false } = {}
) => {
  if (typeof timestamp !== "string" || !timestamp) {
    return "";
  }

  const date = parseTimestamp(timestamp);

  if (!date) return "";

  try {
    return dateFormat(date, format, inUTC);
  } catch (error) {
    console.warn(`Error while formatting date '${date}'`, error);
    return "";
  }
};

const parseTimestamp = (timestamp: string): Date | null => {
  let parsedTimestamp = new Date(timestamp);

  if (isNaN(parsedTimestamp.getTime())) {
    const sanitizedTimestamp = timestamp.trim().replace(/\s+/, "T");
    parsedTimestamp = new Date(sanitizedTimestamp);
  }

  return isNaN(parsedTimestamp.getTime()) ? null : parsedTimestamp;
};
