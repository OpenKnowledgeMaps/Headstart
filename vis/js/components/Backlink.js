import React from "react";
import config from "config";
import { connect } from "react-redux";

import BacklinkTemplate from "../templates/Backlink";

export const Backlink = ({ hidden, onClick }) => {
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
    />
  );
};

const mapStateToProps = (state) => ({
  hidden: !state.backlink,
  onClick: state.backlink ? state.backlink.onClick : undefined,
});

export default connect(mapStateToProps)(Backlink);