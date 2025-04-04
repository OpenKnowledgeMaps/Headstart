// @ts-nocheck

import { handleTitleAction } from "../utils/title";

const createPageTitleMiddleware = (originalTitle) => {
  return function ({ getState }) {
    return (next) => (action: any) => {
      if (!action.canceled && !action.isFromBackButton) {
        const state = getState();
        handleTitleAction(action, originalTitle, state);
      }

      return next(action);
    };
  };
};

export default createPageTitleMiddleware;
