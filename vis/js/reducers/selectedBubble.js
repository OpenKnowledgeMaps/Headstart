const selectedBubble = (state = null, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "ZOOM_OUT":
      return null;
    case "INITIALIZE":
      return null;
    case "ZOOM_IN":
      return {
        title: action.selectedAreaData.title,
        uri: action.selectedAreaData.uri,
        color: action.selectedAreaData.color,
        docIds: action.selectedAreaData.docIds,
      };
    case "SCALE":
      return null;
    default:
      return state;
  }
};

export default selectedBubble;
