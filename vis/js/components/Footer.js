import React from "react";
import { connect } from "react-redux";

import CreatedBy from "../templates/footers/CreatedBy";

const Footer = ({ service, timestamp, faqsUrl }) => {
  if (typeof service !== "string") {
    return null;
  }

  if (service.startsWith("triple") || ["base", "pubmed"].includes(service)) {
    return <CreatedBy timestamp={timestamp} faqsUrl={faqsUrl} />;
  }

  return null;
};

const mapStateToProps = (state) => ({
  service: state.service,
  timestamp: state.misc.timestamp,
  faqsUrl: state.modals.FAQsUrl,
});

export default connect(mapStateToProps)(Footer);
