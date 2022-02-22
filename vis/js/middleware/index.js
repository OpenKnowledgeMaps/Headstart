import { applyMiddleware } from "redux";

import actionQueueMiddleware from "./actionQueue";
import chartTypeMiddleware from "./chartType";
import pageTitleMiddleware from "./pageTitle";
import queryParameterMiddleware from "./queryParameter";
import recordActionMiddleware from "./recordAction";
import repeatedInitializeMiddleware from "./repeatedInitialize";
import rescaleMiddleware from "./rescale";
import scrollMiddleware from "./scroll";

export {
  actionQueueMiddleware,
  chartTypeMiddleware,
  pageTitleMiddleware,
  queryParameterMiddleware,
  recordActionMiddleware,
  repeatedInitializeMiddleware,
  rescaleMiddleware,
  scrollMiddleware,
};

const applyHeadstartMiddleware = (intermediate) => {
  return applyMiddleware(
    chartTypeMiddleware,
    actionQueueMiddleware(intermediate.actionQueue),
    scrollMiddleware,
    repeatedInitializeMiddleware(
      intermediate.applyForceLayout.bind(intermediate)
    ),
    rescaleMiddleware(intermediate.rescaleMap.bind(intermediate)),
    recordActionMiddleware,
    queryParameterMiddleware,
    pageTitleMiddleware(intermediate.originalTitle)
  );
};

export default applyHeadstartMiddleware;
