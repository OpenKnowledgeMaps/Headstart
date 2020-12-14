const zoom = (state = false, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "ZOOM_IN":
      return true;
    case "ZOOM_OUT":
      return false;
    default:
      return state;
  }
};

export default zoom;
