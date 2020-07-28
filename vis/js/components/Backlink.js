import React from "react";
import config from "config";
import { connect } from "react-redux";
import { zoomOut } from "../actions";

import BacklinkTemplate from "../templates/Backlink";

export const Backlink = ({ hidden, streamgraph, dispatch }) => {
  if (hidden) {
    return null;
  }

  return (
    <BacklinkTemplate
      label={config.localization[config.language].backlink}
      onClick={() => dispatch(zoomOut())}
      className={streamgraph ? "backlink backlink-streamgraph" : "backlink"}
    />
  );
};

const mapStateToProps = (state) => ({
  hidden: !state.zoom,
  streamgraph: state.chartType === "streamgraph",
});

export default connect(mapStateToProps)(Backlink);
