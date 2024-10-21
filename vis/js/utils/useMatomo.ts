/* eslint-disable no-undef */
const useMatomo = () => {
  const trackEvent = trackMatomoEvent;

  return { trackEvent };
};

export default useMatomo;

export const trackMatomoEvent = (category: string, action: string, name?: string, value?: string, dimensions?: string) => {
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

  // @ts-ignore
  if (typeof _paq !== "undefined") {
    // @ts-ignore
    _paq.push(trackingArray);
  }
};
