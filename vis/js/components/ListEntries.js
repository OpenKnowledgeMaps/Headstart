import React from "react";
import { connect } from "react-redux";

import BasicListEntries from "./listentries/BasicListEntries";
import ClassificationListEntries from "./listentries/ClassificationListEntries";
import StandardListEntries from "./listentries/StandardListEntries";

const ListEntries = ({ show, service, displayedData }) => {
  if (!show) {
    return null;
  }

  if (service === null || typeof service === "undefined") {
    return <BasicListEntries displayedData={displayedData} />;
  }

  if (service.startsWith("linkedcat")) {
    return <ClassificationListEntries displayedData={displayedData} />;
  }

  return <StandardListEntries displayedData={displayedData} />;
};

const mapStateToProps = (state) => ({
  show: state.list.show,
  service: state.service,
});

export default connect(mapStateToProps)(ListEntries);
