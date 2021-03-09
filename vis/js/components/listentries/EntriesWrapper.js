import React from "react";
import { connect } from "react-redux";

const EntriesWrapper = ({ height, children }) => {
  return (
    <div
      className="col-xs-12"
      id="papers_list"
      style={{ display: "block", height: !!height ? height : undefined }}
    >
      {children}
    </div>
  );
};

const mapStateToProps = (state) => ({
  height: state.list.height,
});

export default connect(mapStateToProps)(EntriesWrapper);
