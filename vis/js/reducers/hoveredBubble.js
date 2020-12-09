const hoveredBubble = (state = null, action) => {
  switch (action.type) {
    case "HOVER_AREA":
      if (action.canceled) {
        return state;
      }
      return action.uri;
    default:
      return state;
  }
};

export default hoveredBubble;
