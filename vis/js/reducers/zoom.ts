const zoom = (state = false, action: any) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "ZOOM_IN":
      return true;
    case "ZOOM_OUT":
      return false;
    case "INITIALIZE":
      return false;
    case "SCALE":
      return false;
    default:
      return state;
  }
};

export default zoom;
