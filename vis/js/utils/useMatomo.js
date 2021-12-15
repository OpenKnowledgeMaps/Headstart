/* eslint-disable no-undef */
const useMatomo = () => {
  const trackEvent = trackMatomoEvent;

  return { trackEvent };
};

export default useMatomo;

export const trackMatomoEvent = (category, action, name, value, dimensions) => {
  if (typeof _paq !== "undefined") {
    _paq.push(["trackEvent", category, action, name, value, dimensions]);
  }
};
