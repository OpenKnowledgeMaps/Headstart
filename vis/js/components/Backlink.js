import React from "react";
import config from "config";
import { connect } from "react-redux";
import { zoomOut } from "../actions";

import BacklinkTemplate from "../templates/Backlink";

export const Backlink = ({ hidden, streamgraph, onClick }) => {
  if (hidden) {
    return null;
  }

  const handleOnClick = () => {
    console.warn("*** React component 'Backlink' clicked ***");
    if (onClick && typeof onClick === "function") {
      onClick();
    }
  };

  return (
    <BacklinkTemplate
      label={config.localization[config.language].backlink}
      onClick={handleOnClick}
      className={streamgraph ? "backlink backlink-streamgraph" : "backlink"}
    />
  );
};

const mapStateToProps = (state) => ({
  hidden: !state.zoom,
  streamgraph: state.chartType === "streamgraph",
});

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(zoomOut()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Backlink);
