// @ts-nocheck

import { createTransition } from "../utils/transition";

const DURATION = 900;

// ? investigate why state is null. It should be an object, but if it's set to object by default, it will break the app loading system
const animation = (state = null, action: any) => {
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
