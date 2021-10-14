import React from "react";

//import pubmedLogo from "../../../../images/logos/pubmed_logo.png";

import StandardKMInfo from "./subcomponents/StandardKMInfo";

const PubMedInfo = ({ params }) => {
  return (
    // html template starts here
    <StandardKMInfo
      serviceName="PubMed"
      serviceDesc={
        <>
          PubMed comprises more than 26 million citations for biomedical
          literature from MEDLINE, life science journals, and online books. For
          more information please{" "}
          <a
            className="underline"
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
