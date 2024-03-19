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
          PubMed comprises more than 35 million citations for biomedical
          literature from MEDLINE, life science journals, and online books. For
          more information please{" "}
          <a
            href="http://www.ncbi.nlm.nih.gov/pubmed"
            target="_blank "
          >
            visit the PubMed website
          </a>
          .
        </>
      }
      params={params}
    />
    // html template ends here
  );
};

export default PubMedInfo;
