import { handleTitleAction } from "../utils/title";

const createPageTitleMiddleware = (itm) => {
  return function ({ getState }) {
    return (next) => (action) => {
      if (!action.canceled && !action.isFromBackButton) {
        const state = getState();
        handleTitleAction(action, itm.originalTitle, state);
      }

      return next(action);
    };
  };
};

export default createPageTitleMiddleware;
