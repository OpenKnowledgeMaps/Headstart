import { STREAMGRAPH_MODE } from "../reducers/chartType";

/**
 * Creates a middleware that adds a boolean 'isStreamgraph' to each action.
 */
const chartTypeMiddleware = ({ getState }) => {
  return (next) => (action) => {
    action.isStreamgraph = getState().chartType === STREAMGRAPH_MODE;
    return next(action);
  };
};

export default chartTypeMiddleware;
