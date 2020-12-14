const bubbleOrder = (state = { hoveredBubble: null, order: [] }, action) => {
  if (action.canceled) {
    return state;
  }
  switch (action.type) {
    case "HOVER_BUBBLE":
      return {
        ...state,
        hoveredBubble: action.uri,
        order: getBubbleOrder(action.uri, state.order),
      };
    case "ZOOM_IN":
      return {
        ...state,
        hoveredBubble: action.selectedAreaData.uri,
        order: getBubbleOrder(action.selectedAreaData.uri, state.order),
      };
    case "ZOOM_OUT":
      return {
        ...state,
        hoveredBubble: null,
      };
    default:
      return state;
  }
};

export default bubbleOrder;

const getBubbleOrder = (areaUri, previousOrder) => {
  if (!areaUri) {
    return previousOrder;
  }
  const newBubbleOrder = previousOrder.filter((uri) => uri !== areaUri);
  newBubbleOrder.push(areaUri);

  return newBubbleOrder;
};
