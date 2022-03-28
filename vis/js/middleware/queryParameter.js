import { handleUrlAction } from "../utils/url";

const queryParameterMiddleware = () => {
  return (next) => (action) => {
    if (!action.canceled && !action.isFromBackButton) {
      handleUrlAction(action);
    }

    return next(action);
  };
};

export default queryParameterMiddleware;
