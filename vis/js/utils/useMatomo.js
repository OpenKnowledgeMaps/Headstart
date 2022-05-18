/* eslint-disable no-undef */
const useMatomo = () => {
  const trackEvent = trackMatomoEvent;

  return { trackEvent };
};

export default useMatomo;

export const trackMatomoEvent = (category, action, name, value, dimensions) => {
  const trackingArray = [
    "trackEvent",
    category,
    action,
    name,
    value,
    dimensions,
  ];

  if (process.env.NODE_ENV === "development") {
    console.log("DEBUG: tracking matomo event", trackingArray);
  }

  if (typeof _paq !== "undefined") {
    _paq.push(trackingArray);
  }
};
