import React from "react";
import config from "config";
import { connect } from "react-redux";

import BacklinkTemplate from "../templates/Backlink";

const Backlink = ({ hidden, onClick }) => {
  if (hidden) {
    return null;
  }

  return (
    <BacklinkTemplate
      label={config.localization[config.language].backlink}
      onClick={onClick}
    />
  );
};

const mapStateToProps = (state) => ({
  hidden: !state.backlink,
  onClick: state.backlink ? state.backlink.onClick : undefined,
});

export default connect(mapStateToProps)(Backlink);
