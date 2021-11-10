const tracking = (state = {}, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        trackMouseOver: action.configObject.enable_mouseover_evaluation,
      };
    default:
      return state;
  }
};

export default tracking;
