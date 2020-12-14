const highlightedBubble = (state = null, action) => {
  if (action.canceled) {
    return state;
  }
  switch (action.type) {
    case "HIGHLIGHT_AREA":
      return action.uri;
    default:
      return state;
  }
};

export default highlightedBubble;
