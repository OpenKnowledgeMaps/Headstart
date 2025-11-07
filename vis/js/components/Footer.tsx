import React from "react";
import { connect } from "react-redux";

import { STREAMGRAPH_MODE } from "../reducers/chartType";
import CreatedBy from "../templates/footers/CreatedBy";
import { ServiceType, State } from "../types";

const SUPPORTED_SERVICES = ["base", "pubmed", "openaire", "orcid", "aquanavi"];

const Footer = ({
  service,
  timestamp,
  faqsUrl,
  faqsUrlStr,
  isStreamgraph,
}: {
  service: ServiceType;
  timestamp: string | undefined;
  faqsUrl: string;
  faqsUrlStr: string;
  isStreamgraph: boolean;
}) => {
  if (typeof service !== "string") {
    return null;
  }

  if (service.startsWith("triple") || SUPPORTED_SERVICES.includes(service)) {
    return (
      <CreatedBy
        timestamp={timestamp}
        faqsUrl={isStreamgraph ? faqsUrlStr : faqsUrl}
      />
    );
  }

  return null;
};

const mapStateToProps = (state: State) => ({
  service: state.service,
  timestamp: state.misc.timestamp,
  faqsUrl: state.modals.FAQsUrl,
  faqsUrlStr: state.modals.FAQsUrlStr,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
});

export default connect(mapStateToProps)(Footer);
