import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { zoomOut } from "../actions";
import { STREAMGRAPH_MODE } from "../reducers/chartType";

import BacklinkTemplate from "../templates/Backlink";

import { createAnimationCallback } from "../utils/eventhandlers";

export const Backlink = ({
  hidden = false,
  streamgraph = false,
  onClick,
  localization = {},
}) => {
  if (hidden) {
    return null;
  }

  const handleOnClick = () => {
    if (onClick && typeof onClick === "function") {
      onClick();
    }
  };

  // TODO do not trigger on first render
  const { area } = useQueryParams();
  useEffect(() => {
    if (!area) {
      handleOnClick();
    }
    // TODO wtf
  }, area);

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

// TODO hook
const useQueryParams = () => {
  const [params, setParams] = useState(
    new URLSearchParams(window.location.search)
  );

  const listenToPopstate = () => {
    const newParams = new URLSearchParams(window.location.search);
    setParams(newParams);
  };

  useEffect(() => {
    window.addEventListener("popstate", listenToPopstate);
    return () => {
      window.removeEventListener("popstate", listenToPopstate);
    };
  }, []);

  return params;
};
