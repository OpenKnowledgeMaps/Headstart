const chart = (
  state = {
    width: null,
    streamWidth: null,
    height: null,
    streamHeight: null,
  },
  action
) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        width: action.chartSize,
        streamWidth: action.streamWidth,
        height: action.chartSize,
        streamHeight: action.streamHeight,
      };
    case "RESIZE":
      return {
        ...state,
        width: action.chartSize,
        streamWidth: action.streamWidth,
        height: action.chartSize,
        streamHeight: action.streamHeight,
      };
    default:
      return state;
  }
};

export default chart;
