import React from "react";

//import tripleLogo from "../../../../images/logos/triple_logo.png";

import StandardKMInfo from "./subcomponents/StandardKMInfo";

const TripleKMInfo = ({ params }) => {
  return (
    // html template starts here
    <StandardKMInfo
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

export default TripleKMInfo;
