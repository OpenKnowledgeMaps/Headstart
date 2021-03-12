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
        showCreatedBy: action.configObject.credit_embed,
        showCreatedByViper: action.configObject.credit,
        createdByUrl: action.configObject.canonical_url,
        renderMap: action.configObject.render_map,
        renderList: action.configObject.render_list,
        isLoading: false,
        visTag: action.configObject.tag,
      };
    default:
      return state;
  }
};

export default misc;
