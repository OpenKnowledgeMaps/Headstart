/**
 * Creates a middleware that calls the rescaling function on the 'SCALE' action.
 *
 * @param {Function} rescaleCallback function that rescales the map
 */
const createRescaleMiddleware = (rescaleCallback) => {
  return () => {
    return (next) => (action) => {
      if (action.type === "SCALE") {
        rescaleCallback(
          action.value,
          action.baseUnit,
          action.contentBased,
          action.sort
        );
      }
      return next(action);
    };
  };
};

export default createRescaleMiddleware;
