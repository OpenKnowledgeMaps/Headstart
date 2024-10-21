// @ts-nocheck
import logAction from "../utils/actionLogger";

const recordActionMiddleware = ({ getState }) => {
  return (next) => (action: any) => {
    if (!action.canceled) {
      const state = getState();
      logAction(action, state);
    }
    return next(action);
  };
};

export default recordActionMiddleware;
