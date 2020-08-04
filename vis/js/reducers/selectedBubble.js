const selectedBubble = (state = null, action) => {
  switch (action.type) {
    case "ZOOM_OUT":
      return null;
    case "ZOOM_IN":
      // TODO
      return {
        title: "TODO add real area title"
      };
    default:
      return state;
  }
};

export default selectedBubble;
