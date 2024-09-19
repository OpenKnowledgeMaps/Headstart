import React from "react";
import { connect } from "react-redux";

import CreatedBy from "../templates/footers/CreatedBy";
import {STREAMGRAPH_MODE} from "../reducers/chartType";

const Footer = ({service, timestamp, faqsUrl, faqsUrlStr, isStreamgraph}) => {
  if (typeof service !== "string") {
    return null;
  }

  if (service.startsWith("triple") || ["base", "pubmed", "openaire", "orcid"].includes(service)) {
    return <CreatedBy timestamp={timestamp} faqsUrl={isStreamgraph ? faqsUrlStr : faqsUrl}/>;
  }

  return null;
};

const mapStateToProps = (state) => ({
  service: state.service,
  timestamp: state.misc.timestamp,
  faqsUrl: state.modals.FAQsUrl,
  faqsUrlStr: state.modals.FAQsUrlStr,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
});

export default connect(mapStateToProps)(Footer);
