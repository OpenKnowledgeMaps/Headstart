const selectedBubble = (state = null, action) => {
  switch (action.type) {
    case "ZOOM_OUT":
      return null;
    case "ZOOM_IN":
      return {
        title: action.selectedAreaData.title,
        uri: action.selectedAreaData.uri,
        color: action.selectedAreaData.color,
      };
    default:
      return state;
  }
};

export default selectedBubble;
