
import React from "react";
import { connect } from "react-redux";
import { zoomOut } from "../actions";
import { STREAMGRAPH_MODE } from "../reducers/chartType";

import BackLinkTemplate from "../templates/Backlink";

import { createAnimationCallback } from "../utils/eventhandlers";
import useMatomo from "../utils/useMatomo";
import { Dispatch } from "redux";

export interface BackLinkProps {
  hidden?: boolean;
  streamgraph?: boolean;
  onClick: () => void;
  localization: any
}

export const BackLink = ({
  hidden = false,
  streamgraph = false,
  onClick,
  localization = {},
}: BackLinkProps) => {
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
    <BackLinkTemplate
      label={localization.backlink}
      onClick={handleOnClick}
      className={streamgraph ? "backlink backlink-streamgraph" : "backlink"}
    />
  );
};

const mapStateToProps = (state: any) => ({
  localization: state.localization,
  hidden: !state.zoom,
  streamgraph: state.chartType === STREAMGRAPH_MODE,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClick: () => dispatch(zoomOut(createAnimationCallback(dispatch))),
});

export default connect(mapStateToProps, mapDispatchToProps)(BackLink);
