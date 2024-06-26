import React from "react";
import { connect } from "react-redux";
import { zoomOut } from "../actions";
import { STREAMGRAPH_MODE } from "../reducers/chartType";

import BacklinkTemplate from "../templates/Backlink";

import { createAnimationCallback } from "../utils/eventhandlers";
import useMatomo from "../utils/useMatomo";

export const Backlink = ({
  hidden = false,
  streamgraph = false,
  onClick,
  localization = {},
}) => {
  const { trackEvent } = useMatomo();

  if (hidden) {
    return null;
  }

  const handleOnClick = () => {
    trackEvent("Title & Context line", "Zoom out", "Backlink");
    if (onClick && typeof onClick === "function") {
      onClick();
    }
  };

  return (
    <BacklinkTemplate
      label={localization.backlink}
      onClick={handleOnClick}
      className={streamgraph ? "backlink backlink-streamgraph" : "backlink"}
    />
  );
};

const mapStateToProps = (state) => ({
  localization: state.localization,
  hidden: !state.zoom,
  streamgraph: state.chartType === STREAMGRAPH_MODE,
});

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(zoomOut(createAnimationCallback(dispatch))),
});

export default connect(mapStateToProps, mapDispatchToProps)(Backlink);
