const paperOrder = (state = { hoveredPaper: null, order: [], enlargeFactor: 1 }, action) => {
  if (action.canceled) {
    return state;
  }
  switch (action.type) {
    case "HOVER_PAPER":
      return {
        ...state,
        hoveredPaper: action.safeId,
        order: getPaperOrder(action.safeId, state.order),
        enlargeFactor: action.enlargeFactor ? action.enlargeFactor : state.enlargeFactor,
      };
    default:
      return state;
  }
};

export default paperOrder;

const getPaperOrder = (safeId, previousOrder) => {
  if (!safeId) {
    return previousOrder;
  }
  const newPaperOrder = previousOrder.filter((id) => id !== safeId);
  newPaperOrder.push(safeId);

  return newPaperOrder;
};
