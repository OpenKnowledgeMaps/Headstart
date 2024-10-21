// @ts-nocheck

import { handleUrlAction } from "../utils/url";

const queryParameterMiddleware = () => {
  return (next) => (action: any) => {
    if (!action.canceled && !action.isFromBackButton) {
      handleUrlAction(action);
    }

    return next(action);
  };
};

export default queryParameterMiddleware;
