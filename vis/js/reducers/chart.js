const chart = (
  state = {
    width: null,
    height: null,
  },
  action
) => {
  switch (action.type) {
    case "RESIZE":
      return {
        ...state,
        width: action.chartSize,
        height: action.chartSize,
      };
    default:
      return state;
  }
};

export default chart;
