import { createTransition } from "../utils/transition";

const animation = (state = null, action) => {
  switch (action.type) {
    case "ZOOM_IN":
      return {
        ...state,
        transition: createTransition(action.callback),
        type: "ZOOM_IN",
        alreadyZoomed: action.alreadyZoomed,
      };
    case "ZOOM_OUT":
      return {
        ...state,
        transition: createTransition(action.callback),
        type: "ZOOM_OUT",
      };
    case "STOP_ANIMATION":
      // TODO maybe interrupt the transition?
      return null;
    default:
      return state;
  }
};

export default animation;
