import { createTransition } from "../utils/transition";

const DURATION = 900;

const animation = (state = null, action) => {
  if (action.canceled || action.isStreamgraph) {
    return state;
  }
  switch (action.type) {
    case "ZOOM_IN":
      return {
        ...state,
        transition: createTransition(DURATION, action.callback),
        type: "ZOOM_IN",
        alreadyZoomed: action.alreadyZoomed,
      };
    case "ZOOM_OUT":
      return {
        ...state,
        transition: createTransition(DURATION, action.callback),
        type: "ZOOM_OUT",
      };
    case "STOP_ANIMATION":
      return null;
    default:
      return state;
  }
};

export default animation;
