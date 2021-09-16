import React from "react";
import { connect } from "react-redux";

import StandardBuiltWith from "../templates/footers/StandardBuiltWith";
import TripleBuiltWith from "../templates/footers/TripleBuiltWith";

const Footer = ({ service, timestamp }) => {
  if (typeof service === "string" && service.startsWith("triple")) {
    return <TripleBuiltWith />;
  }

  if (service === "base") {
    return (
      <StandardBuiltWith
        timestamp={timestamp}
        codebaseUrl="https://github.com/ropenscilabs/rbace"
        codebaseName="rbace"
        sourceUrl="http://base-search.net"
        sourceName="BASE"
      />
    );
  }

  if (service === "pubmed") {
    return (
      <StandardBuiltWith
        timestamp={timestamp}
        codebaseUrl="https://github.com/ropensci/rentrez"
        codebaseName="rentrez"
        sourceUrl="http://www.ncbi.nlm.nih.gov/pubmed"
        sourceName="PubMed"
      />
    );
  }

  return null;
};

const mapStateToProps = (state) => ({
  service: state.service,
  timestamp: state.misc.timestamp,
});

export default connect(mapStateToProps)(Footer);
