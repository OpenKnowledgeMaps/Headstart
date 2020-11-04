const previewModal = (state = { show: false, paper: null }, action) => {
  switch (action.type) {
    case "SHOW_PREVIEW":
      return {
        show: true,
        paper: action.paper,
      };
    case "HIDE_PREVIEW":
      return null;
    default:
      return state;
  }
};

export default previewModal;
