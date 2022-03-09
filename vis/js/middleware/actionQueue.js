import { ALLOWED_IN_ANIMATION, NOT_QUEUED_IN_ANIMATION } from "../actions";

/**
 * Creates an action-queuing middleware.
 *
 * When the chart is animated, most actions must not be triggered. This middleware
 * cancels them and saves them in a queue. They are fired again after the animation
 * finishes.
 *
 * It cancels all actions but those in ALLOWED_IN_ANIMATION. Those actions are then
 * queued (except those in NOT_QUEUED_IN_ANIMATION).
 *
 * @param {Object} intermediate the intermediate instance (this)
 */
const createActionQueueMiddleware = (actionQueue) => {
  return (store) => {
    return (next) => (action) => {
      const { getState, dispatch } = store;

      if (getState().animation !== null) {
        if (!ALLOWED_IN_ANIMATION.includes(action.type)) {
          if (
            !NOT_QUEUED_IN_ANIMATION.includes(action.type) ||
            action.isFromBackButton
          ) {
            actionQueue.push({ ...action });
          }
          action.canceled = true;
          return next(action);
        }
      }

      const returnValue = next(action);

      if (action.type === "STOP_ANIMATION") {
        while (actionQueue.length > 0) {
          const queuedAction = actionQueue.shift();
          if (!NOT_QUEUED_IN_ANIMATION.includes(queuedAction.type)) {
            dispatch(queuedAction);
          } else {
            requestAnimationFrame(() => {
              dispatch(queuedAction);
            });
          }
        }
      }

      return returnValue;
    };
  };
};

export default createActionQueueMiddleware;
