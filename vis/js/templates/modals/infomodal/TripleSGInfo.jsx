import React from "react";

import tripleLogo from "../../../../images/logos/triple_logo.png";

import StandardSGInfo from "./subcomponents/StandardSGInfo";

const TripleSGInfo = ({ params }) => {
  return (
    // html template starts here
    <StandardSGInfo
      serviceName="GoTriple"
      serviceDesc={
        <>
          <p>
          </p>
        </>
      }
      params={params}
    />
    // html template ends here
  );
};

export default TripleSGInfo;
