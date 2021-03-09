const selectedPaper = (state = null, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "ZOOM_OUT":
      return null;
    case "SCALE":
      return null;
    case "INITIALIZE":
      return null;
    case "DESELECT_PAPER":
      return null;
    case "DESELECT_PAPER_BACKLINK":
      return null;
    case "SELECT_PAPER":
      return {
        safeId: action.safeId,
      };
    default:
      return state;
  }
};

export default selectedPaper;
