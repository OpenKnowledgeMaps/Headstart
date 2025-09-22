// @ts-nocheck

import React from "react";

//import pubmedLogo from "../../../../images/logos/pubmed_logo.png";

import StandardKMInfo from "./subcomponents/StandardKMInfo";
import StandardSGInfo from "./subcomponents/StandardSGInfo";

const PubMedInfo = ({ params, isStreamgraph }) => {
  const MainTemplate = isStreamgraph ? StandardSGInfo : StandardKMInfo;

  return (
    // html template starts here
    <MainTemplate
      serviceName="PubMed"
      serviceDesc={
        <>
          PubMed comprises more than 38 million citations for biomedical
          literature from MEDLINE, life science journals, and online books. For
          more information please{" "}
          <a href="http://www.ncbi.nlm.nih.gov/pubmed" target="_blank ">
            visit the PubMed website
          </a>
          .
          <br />
          Citations are available for documents with a DOI and based on citation
          data provided by{" "}
          <a href="https://www.crossref.org/" target="_blank">
            Crossref
          </a>
          . Results may be impacted by accuracy and completeness of this data.
        </>
      }
      params={params}
    />
    // html template ends here
  );
};

export default PubMedInfo;
