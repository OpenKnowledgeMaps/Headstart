import dateFormat from "dateformat";

export const getDateTimeFromTimestamp = (timestamp) => {
  if (typeof timestamp !== "string" || !timestamp) {
    return "";
  }

  const date = getDateFromTimestamp(timestamp);
  const time = getTimeFromTimestamp(timestamp);

  return `on ${date} at ${time}`;
};

export const getDateFromTimestamp = (timestamp) => {
  if (typeof timestamp !== "string" || !timestamp) {
    return "";
  }

  timestamp = timestamp.trim().replace(/\s+/, "T");

  const date = new Date(timestamp);

  try {
    return dateFormat(date, "d mmm yyyy");
  } catch (error) {
    console.warn(error);
    return "";
  }
};

export const getTimeFromTimestamp = (timestamp) => {
  if (typeof timestamp !== "string" || !timestamp) {
    return "";
  }

  timestamp = timestamp.trim().replace(/\s+/, "T");

  const date = new Date(timestamp);

  try {
    return dateFormat(date, "H:MM");
  } catch (error) {
    console.warn(error);
    return "";
  }
};
