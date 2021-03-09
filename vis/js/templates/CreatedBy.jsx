import React from "react";
import { connect } from "react-redux";

import logo from "images/okmaps-logo-round.png";

const divStyle = {
  position: "absolute",
  left: 0,
  bottom: 0,
  fontSize: 10,
  backgroundColor: "#eff3f4",
  padding: "0px 0px 0px 5px",
  borderRadius: "0px 50px 50px 0px",
};

const CreatedBy = ({ show, url }) => {
  if (!show) {
    return null;
  }

  return (
    <div id="credit_embed" style={divStyle}>
      <a href={url} target="_blank">
        created by <b>Open Knowledge Maps </b>
        <img src={logo} id="credit_logo" style={{ height: 30, padding: 0 }} />
      </a>
    </div>
  );
};

const mapStateToProps = (state) => ({
  url: state.misc.createdByUrl,
  show: state.misc.showCreatedBy,
});

export default connect(mapStateToProps)(CreatedBy);
