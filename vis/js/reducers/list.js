const list = (state = { show: true, docsNumber: 0 }, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        show: !!action.configObject.show_list,
        // TODO init number of all documents
      };
    case "TOGGLE_LIST":
      return {
        ...state,
        show: !state.show,
      };
    case "SHOW_LIST":
      return {
        ...state,
        show: true,
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
