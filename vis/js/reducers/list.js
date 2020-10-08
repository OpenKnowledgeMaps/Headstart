const list = (state = { show: true, docsNumber: 0 }, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        // TODO init data (shown list, number of all documents)
      };
    case "TOGGLE_LIST":
      return {
        ...state,
        show: !state.show,
      };
    case "SET_ITEMS_COUNT":
      return {
        ...state,
        docsNumber: action.count,
      };
    default:
      return state;
  }
};

export default list;
