const misc = (
  state = {
    isEmbedded: false,
    isLoading: true,
    showCreatedByViper: false,
    showLoading: false,
    renderList: false,
    renderMap: false,
    timestamp: null,
    visTag: null,
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
        isLoading: false,
      };
    default:
      return state;
  }
};

export default misc;
