const misc = (state = { isLoading: true, showLoading: false }, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "PREINITIALIZE":
      return {
        ...state,
        showLoading: action.configObject.show_loading_screen,
      };
    case "INITIALIZE":
      return {
        ...state,
        isEmbedded: action.configObject.credit_embed,
        showCreatedByViper: action.configObject.credit,
        renderMap: action.configObject.render_map,
        renderList: action.configObject.render_list,
        isLoading: false,
        visTag: action.configObject.tag,
        timestamp: action.contextObject.timestamp,
      };
    default:
      return state;
  }
};

export default misc;
